const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const Nurse = require('../models/nurse');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/');
	},
	filename: function (req, file, cb) {
		const nameParts = file.originalname.split('.');
		const originalNameWithoutExt = nameParts.slice(0, -1).join('.').replace(/-/g, '_');
		const extension = nameParts[nameParts.length - 1];
		const randomString = crypto.randomBytes(1).toString('hex');
		const customFileName = `${originalNameWithoutExt}${randomString}.${extension}`;

		cb(null, customFileName);
	}
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 50 },
});

const { realTimeAnswersToModel, answersToModel, getId, computeAndReply } = require('../helper');
const { mail } = require('../helper/mail');
const authenticate = require('../helper/auth');

const { questions, ID } = require('../data/questions');

const Patient = require('../models/patient');
const Session = require('../models/session');
const Doctor = require('../models/doctor');
const { Hits } = require('../models/miscellaneous');

const router = express.Router();

require('../helper/corona_data');
const { compute } = require("../compute/compute");
const FollowUpPatient = require('../models/followup');

//prescription and diagnosis
router.post('/presc_n_diagnosis', upload.single('file'), async (req, res) => {
	try {
		const { type, patientId, index } = req.body;

		// Validate required fields
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		if (!type || !patientId) {
			return res.status(400).json({ message: 'Type and Patient ID are required' });
		}

		// Construct file path
		const filePath = `https://teleniir.com/aa/images/${req.file.filename}`;

		// Determine update field based on type
		let updateField;
		if (type === 'prescription') {
			updateField = { prescription: filePath };
		} else if (type === 'diagnosis') {
			updateField = { diagnosis: filePath };
		} else {
			return res.status(400).json({ message: 'Invalid type. Must be "prescription" or "diagnosis".' });
		}

		// Fetch the main patient record
		const patient = await Patient.findById(patientId);
		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}

		// Push the chat update
		patient.chat.push({
			statement: `chat-img-${req.file.filename}`,
			type: 'incoming',
		});
		await patient.save();

		let updatedPatient;
		if (index > 1) {
			// Handle FollowUpPatient updates
			const followUpPatient = await FollowUpPatient.findOneAndUpdate(
				{ id: patientId, Visit: index }, // Match the patient and visit index
				{ $set: updateField },
				{ new: true }
			);

			if (!followUpPatient) {
				return res.status(404).json({ message: 'Follow-up patient not found for the given index.' });
			}
			updatedPatient = followUpPatient;
		} else {
			// Handle regular patient updates
			updatedPatient = await Patient.findByIdAndUpdate(
				patientId,
				{ $set: updateField },
				{ new: true }
			);

			if (!updatedPatient) {
				return res.status(404).json({ message: 'Patient update failed.' });
			}
		}

		res.status(200).json({
			message: 'File uploaded and updated successfully',
			filePath,
			updatedPatient,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal server error', error: err.message });
	}
});


router.post("/onlydiagnosis", async (req, res) => {
	try {

		const { patientId, diagnosis } = req.body;
		console.log(diagnosis)
		const updatedPatient = await Patient.findByIdAndUpdate(
			patientId,
			{ $set: { diagnosis: diagnosis } },
			{ new: true }
		);
		res.status(200).json({
			message: 'File uploaded and updated successfully',
		});
	}
	catch (err) {
		console.log(err);
	}
})

router.post('/save-behavior', async (req, res) => {
	const { patientId, behavior } = req.body;

	try {
		await Patient.findByIdAndUpdate(patientId, { behavior });

		res.status(200).json({ message: 'Behavior updated successfully' });
	} catch (error) {
		console.error('Error updating behavior:', error);
		res.status(500).json({ message: 'Error updating behavior' });
	}
});


/* Common */
/**
 * Corona stats
 */
router.get('/cases', (req, res) => {
	fs.readFile(path.join(__dirname, '../data/cases.json'), 'utf8', (err, doc) => {
		if (err) return res.json({ err });
		res.json({
			...JSON.parse(doc)
		});
	});
});
/**
 * total website hits
 */
router.get('/hits', (req, res) => {
	Hits.findOneAndUpdate({}, { $inc: { hits: 1 } }, (err, result) => {
		if (err) return res.json({});
		let hits = 0;
		if (result) {
			hits = result.hits;
		}
		res.json({ hits });
	});
});
// Change from `router.get` to `router.post`
router.post('/hits', async (req, res) => {
	try {
		let result = await Hits.findOneAndUpdate({}, { $inc: { hits: 1 } }, { new: true });

		// If no document was found, create one with initial hits of 1
		if (!result) {
			result = await Hits.create({ hits: 1, totalHits: 1, totalHosts: 1 });
		}

		res.json({ hits: result.hits });
	} catch (err) {
		res.status(500).json({ error: 'An error occurred' });
	}
});


/**
 * upload any image
 * this is used in chat of doctor and patient.
 */
router.post('/image', upload.any(), (req, res) => {
	if (req.files.length) {
		const image = req.files[0];
		console.log(image);
		res.json({ image });
	} else {
		console.log("oh no");
		res.json({});
	}
});

/**
 * gives helpline numbers
 * TODO: Give number based on location
 */
router.post('/helpline', (req, res) => {
	// const { latitude, longitude } = req.body;
	res.json({
		helpline: '011-23978046',
	});
});

/* Patient */
/**
 * Final assessment after initial interaction of patient and chat bot with given questions.
 * Initiation of backend and frontend interaction
 * Pushes into DB after everything is done at the frontend
 * realtime() will gradually replace this or this will be called from backend in the future
 */
router.post('/assessment', (req, res) => {
	const { answers, timestamps, latitude, longitude, chat, session_id: conversation_session_id } = req.body;

	// const oldPatient = answers['23'] === 1
	// 	? getId(answers['24'], answers['25'])												// else oldPatient = name and phone entered
	// 	: null 																										// if new consultation : oldPatient = null

	// console.log("assessment started. oldPatient = ", oldPatient)
	console.log(`answers['23'] = ${answers['23']}. answers['2.5'] = ${answers['2.5']}. (answers['23'] === 0 || answers['2.5'] !== 'undefined') = ${(answers['23'] === 0 || answers['2.5'] !== 'undefined')}
	 answers['24'] = ${answers['24']}. answers['25'] = ${answers['25']}. ID = ${() => {
			if (answers['23'] === 1) getId(answers['24'], answers['25']); else getId(answers['2.5'], answers['2.8'])
		}}
	 answers = ${'pass'/*JSON.stringify(answers)*/}`
	)

	if (answers['23'] === 1) {
		console.log('routes /assessment() oldPatient')
		// TODO : add sessions
		// console.log(oldPatient);
		// Patient.findById(oldPatient, async (err, patient) => {
		// 	if (err || !patient) {
		// 		console.log(err, patient)
		// 		return res.json({
		// 			incomingChats: [
		// 				{
		// 					statement: {
		// 						en: 'We are unable to find your previous records 🙁',
		// 						hi: 'हम आपके पिछले रिकॉर्ड नहीं ढूंढ पा रहे हैं 🙁',
		// 						bn: 'আমরা আপনার আগের রেকর্ডগুলি সন্ধান করতে অক্ষম 🙁'
		// 					},
		// 					type: 'incoming'
		// 				}
		// 			]
		// 		});
		// 	}

		// const { _id, doctor, name, telephone } = patient;
		// mail(
		// 	doctor,
		// 	'Your Patient is Online',
		// 	`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
		// );
		// 	console.log('routes /assessment creating session for new patient')
		// 	// patient.conversation_sessions.push(conversation_session_id)
		// 	const doctorModel = await Doctor.findOne({ username: doctor });
		// 	if (doctorModel.status === 'idle' || doctorModel.status === 'online') {
		// patient.followup = (patient.followup || 0) + 1;
		// 		patient.chat.push({
		// 			statement: "session-closed",
		// 			type: 'incoming',
		// 		});
		// 		await patient.save();
		// 		res.json({
		// 			connectToDoctor: true,
		// 			patientId: _id,
		// 			// incomingChats: patient.chat,
		// 			question: questions[questions.length - 1]
		// 		});
		// 	}
		// 	else {
		// 		return res.json({
		// 			incomingChats: [
		// 				{
		// 					statement: {
		// 						en: "The doctor is currently unavailable, but you can view your chat history by clicking the chat icon next to the doctor 🙁",
		// 						hi: "डॉक्टर इस समय उपलब्ध नहीं हैं, लेकिन आप डॉक्टर के पास चैट आइकन पर क्लिक करके अपनी चैट हिस्ट्री देख सकते हैं 🙁",
		// 						bn: "ডাক্তার বর্তমানে উপলব্ধ নেই, তবে আপনি ডাক্তারের পাশে চ্যাট আইকনে ক্লিক করে আপনার চ্যাট ইতিহাস দেখতে পারেন 🙁"
		// 					},
		// 					type: 'incoming'
		// 				}
		// 			]
		// 		});
		// 	}
		// });
		// TODO : add self screening here and link to consultation. Save data before adding user
		answersToModel(answers, timestamps, async (model) => {
			console.log('post /assessment new patient callback')
			const { name, telephone, hospital } = model;
			console.log(hospital);
			Doctor.findOne({ //Todo , adding hospital 
				$or: [
					{ status: "idle" },
					{ status: "online" }
				]
			}, async (err, doc) => {
				console.log('post /assessment new patient callback find hospital')
				if (err || !doc) {
					console.log('post /assessment new patient doctor not found')
					return res.json({
						incomingChats: [
							{
								statement: {
									en: 'We could not find any doctors 🙁',
									hi: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
									bn: 'আমরা কোনও ডাক্তার খুঁজে পাইনি 🙁'
								},
								type: 'incoming'
							}
						]
					});
				}
				const patient = await Patient.findById({ _id: getId(name, telephone) });
				if (!patient) {
					console.log(patient)
					return res.json({
						incomingChats: [
							{
								statement: {
									en: 'We are unable to find your previous records 🙁',
									hi: 'हम आपके पिछले रिकॉर्ड नहीं ढूंढ पा रहे हैं 🙁',
									bn: 'আমরা আপনার আগের রেকর্ডগুলি সন্ধান করতে অক্ষম 🙁'
								},
								type: 'incoming'
							}
						]
					});
				}
				patient.followup = (patient.followup || 0) + 1;
				patient.chat.push(
					{
						statement: "session-closed",
						type: 'incoming',
					},
					{
						"statement": answers['25.4'] ? changeAnswer(answers['25.4']) : "",
						"type": "outgoing",
					},
					{
						"statement": answers['25.7'] ? changeAnswer(answers['25.7']) : "",
						"type": "outgoing",
					},
					{
						"statement": answers['25.8'] ? changeAnswer(answers['25.8']) : "",
						"type": "outgoing",
					},
				);
				await patient.save();
				// res.json({
				// 	connectToDoctor: true,
				// 	patientId: _id,
				// 	// incomingChats: patient.chat,
				// 	question: questions[questions.length - 1]
				// });
				let villages = [
					// "Ramniya-Kathadi",
					// "Ramniya-Mangi",
					// "Ramniya-Dhira",
					// "Ramniya-Bhagva",
					// "Ramniya-Telvada",
					// "Ramniya-Raghunath Gad",
					// "Ramniya-Dharbahlo Ki Dhani",
					"Siner",
					"Siner-Dharna",
					"Siner-Baliyana",
					"Siner-Gura",
					"Siner-thanmata Hinglaj"
				];

				const changeAnswer = (answer) => {
					let extractedPart = answer.split('/images/')[1];
					console.log(extractedPart);
					extractedPart = `chat-img-${extractedPart}`
					return extractedPart
				}

				FollowUpPatient.create(
					{
						id: getId(name, telephone),
						...model,																			// data prepared through callback from answersToModel
						latitude,
						longitude,
						ip: req.headers['x-real-ip'] || req.ip,
						created_at: Date.now(),
						last_notified_at: Date.now() - 2000,
						chat_id: '',
						doctor: doc.username,
						last_messaged_at: Date.now(),
						chat: chat.slice(4),
						conversation_sessions: [conversation_session_id],
						village: villages[answers['25.1']],
						symptoms: answers['2.4'],
						symptoms_Duration: answers['2.41'],
						BP_systolic: answers['26'],
						BP_diastolic: answers['25.3'],
						SPO2_value: answers['25.5'],
						heart_rate: answers['25.6'],
						BP_Image: answers['25.4'],
						Spo2_Image: answers['25.7'],
						ECG_Image: answers['25.8'],
						prescriptions: [{ id: Date.now(), notation: "", saltName: "", dosage: "", remarks: "" }],
						chat: [
							{
								"statement": answers['25.4'] ? changeAnswer(answers['25.4']) : "",
								"type": "outgoing",
							},
							{
								"statement": answers['25.7'] ? changeAnswer(answers['25.7']) : "",
								"type": "outgoing",
							},
							{
								"statement": answers['25.8'] ? changeAnswer(answers['25.8']) : "",
								"type": "outgoing",
							},
						],
						followup: patient.followup,
						Visit: patient.followup,
					},
					(err, patient) => {
						console.log("this is the err", err)
						if (err) {
							if (err.code === 11000 && err.message.includes('dup key')) {
								// Duplicate key error (patient already registered)
								return res.json({
									incomingChats: [
										{
											statement: {
												en: 'You have already registered. You can call your doctor directly by choosing from the table.',
												hi: 'आप पहले से पंजीकृत हैं। आप सीधे तालिका से अपने डॉक्टर को कॉल कर सकते हैं।',
												bn: 'আপনি ইতিমধ্যেই নিবন্ধিত হয়েছেন। আপনি টেবিল থেকে সরাসরি আপনার ডাক্তারকে কল করতে পারেন।'
											},
											type: 'incoming'
										}
									]
								});
							} else {
								// Other errors (e.g., doctor not found)
								console.error(err);
								return res.json({
									incomingChats: [
										{
											statement: {
												en: 'We could not find any doctors 🙁',
												hi: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
												bn: 'আমরা কোনও ডাক্তার খুঁজে পাইনি 🙁'
											},
											type: 'incoming'
										}
									]
								});
							}
						}


						// no error in patient creation - begin call

						const { id } = patient;

						// mail(
						// 	doc.username,
						// 	'Your Patient is Online',
						// 	`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
						// );

						console.log('post /assessment new patient connect to doctor')
						res.json({
							connectToDoctor: true,
							patientId: id,
							// incomingChats: patient.chat,
							question: questions[questions.length - 1]
						});
					}
				);

			});
		});

	} else {
		console.log('post /assessment new patient')
		// new patient
		answersToModel(answers, timestamps, (model) => {
			console.log('post /assessment new patient callback')
			const { name, telephone, hospital } = model;
			console.log(hospital);
			Doctor.findOne({ //Todo , adding hospital 
				$or: [
					{ status: "idle" },
					{ status: "online" }
				]
			}, (err, doc) => {
				console.log('post /assessment new patient callback find hospital')
				if (err || !doc) {
					console.log('post /assessment new patient doctor not found')
					return res.json({
						incomingChats: [
							{
								statement: {
									en: 'We could not find any doctors 🙁',
									hi: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
									bn: 'আমরা কোনও ডাক্তার খুঁজে পাইনি 🙁'
								},
								type: 'incoming'
							}
						]
					});
				}
				let villages = [
					// "Ramniya-Kathadi",
					// "Ramniya-Mangi",
					// "Ramniya-Dhira",
					// "Ramniya-Bhagva",
					// "Ramniya-Telvada",
					// "Ramniya-Raghunath Gad",
					// "Ramniya-Dharbahlo Ki Dhani",
					"Siner",
					"Siner-Dharna",
					"Siner-Baliyana",
					"Siner-Gura",
					"Siner-thanmata Hinglaj"
				];

				const changeAnswer = (answer) => {
					let extractedPart = answer.split('/images/')[1];
					console.log(extractedPart);
					extractedPart = `chat-img-${extractedPart}`
					return extractedPart
				}
				// Actual push into DB
				Patient.create(
					{
						_id: getId(name, telephone),
						...model,																			// data prepared through callback from answersToModel
						latitude,
						longitude,
						ip: req.headers['x-real-ip'] || req.ip,
						created_at: Date.now(),
						last_notified_at: Date.now() - 2000,
						chat_id: '',
						doctor: doc.username,
						last_messaged_at: Date.now(),
						chat: chat.slice(4),
						conversation_sessions: [conversation_session_id],
						village: villages[answers['25.1']],
						symptoms: answers['2.4'],
						symptoms_Duration: answers['2.41'],
						BP_systolic: answers['26'],
						BP_diastolic: answers['25.3'],
						SPO2_value: answers['25.5'],
						heart_rate: answers['25.6'],
						BP_Image: answers['25.4'],
						Spo2_Image: answers['25.7'],
						ECG_Image: answers['25.8'],
						prescriptions: [{ id: Date.now(), notation: "", saltName: "", dosage: "", remarks: "" }],
						chat: [
							{
								"statement": answers['25.4'] ? changeAnswer(answers['25.4']) : "",
								"type": "outgoing",
							},
							{
								"statement": answers['25.7'] ? changeAnswer(answers['25.7']) : "",
								"type": "outgoing",
							},
							{
								"statement": answers['25.8'] ? changeAnswer(answers['25.8']) : "",
								"type": "outgoing",
							},
						],
						followup: 1,
						Visit: 1,
					},
					(err, patient) => {
						if (err) {
							if (err.code === 11000 && err.message.includes('dup key')) {
								// Duplicate key error (patient already registered)
								return res.json({
									incomingChats: [
										{
											statement: {
												en: 'You have already registered. You can call your doctor directly by choosing from the table.',
												hi: 'आप पहले से पंजीकृत हैं। आप सीधे तालिका से अपने डॉक्टर को कॉल कर सकते हैं।',
												bn: 'আপনি ইতিমধ্যেই নিবন্ধিত হয়েছেন। আপনি টেবিল থেকে সরাসরি আপনার ডাক্তারকে কল করতে পারেন।'
											},
											type: 'incoming'
										}
									]
								});
							} else {
								// Other errors (e.g., doctor not found)
								console.error(err);
								return res.json({
									incomingChats: [
										{
											statement: {
												en: 'We could not find any doctors 🙁',
												hi: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
												bn: 'আমরা কোনও ডাক্তার খুঁজে পাইনি 🙁'
											},
											type: 'incoming'
										}
									]
								});
							}
						}


						// no error in patient creation - begin call

						const { _id } = patient;

						// mail(
						// 	doc.username,
						// 	'Your Patient is Online',
						// 	`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
						// );

						console.log('post /assessment new patient connect to doctor')
						res.json({
							question: questions[questions.length - 1],
							patientId: _id,
							connectToDoctor: true,
							incomingChats: [
								{
									statement: {
										en: `Now you will speak with ${doc.name}`,
										hi: `अब आप ${doc.name} से बात करेंगे,`,
										bn: `এখন আপনি ${doc.name} এর সাথে কথা বলবেন,`
									},
									type: 'incoming'
								}
							]
						});
					}
				);

			});
		});
	}
});

router.post('/realtime', (req, res) => {
	console.log("received realtime post request")
	const data = (req.body)
	let {
		answers,
		timestamps,
		chat,
		currentQuestion,
		answer,
		conversation_session_id,
		options,
		optionSelected,
		nextQuestion,
		answerFormat,
		patient_id,
		reset,
		duration,
		customText,
		back
	} = data

	let command = currentQuestion.command

	// console.log(data)
	console.debug(`Routes.realtime post. session_id =  ${conversation_session_id}. nextQuestion = ${nextQuestion}. answer = ${answer}. 
	currentQuestion = ${currentQuestion.id}. command = ${command}. reset = ${reset}. 
	answerFormat.type = ${answerFormat.type}. customText = ${customText}`)
	// console.debug("Log.d realtime post. session_id = ", conversation_session_id, '. nextQuestion = ', nextQuestion, '. answer = ', answer, '. currentQuestion = ', currentQuestion.id, '. command =', command, '. answerFormat = ', answerFormat)
	// console.log("optionSelected = ", optionSelected)
	// // console.log("answer = ", answer)
	// console.log('answers = ', answers)
	// console.log('timestamps = ', timestamps)
	// console.log('question = ', question)
	// console.log('chat = ', chat)

	const message = {
		statement: "stxatement",
		messageType: "txypeX",
		direction: "direxction",
		answerFormat: answerFormat,
		nextQuestion: nextQuestion,
		optionSelected: optionSelected,
		options: options,
		currentQuestion: currentQuestion,
		timestamp: Date.now(),
		patient_id: patient_id,
		replyDuration: duration,
		back: back
	}

	// TODO somewhere call RealTimeAnswersToModel
	// if (!Session.exists({ _id: session_id })) {
	Session.create(
		{
			_id: conversation_session_id,
			patient_id: patient_id
		},
		async function (err, session) {
			if (err) {

				console.debug('failed to create session in mongo - ' + err)
				console.log("err type = ", typeof err)
				// console.log("err instance = ", instanceof err)
				// Session.findOneAndUpdate({ _id: session_id }, update )

				Session.findOne({ _id: conversation_session_id }, async function (err, sess) {
					if (err) {
						console.error("WTF", err)
						// nothing done
						return res;
					}
					// old session
					console.log('old session')
					console.log('adding message to DB')
					// push into old session
					sess.messages.push(message)
					sess.answers = answers
					console.log(`router.realtime : historyPush.message.currentQuestion[ID] = ${message.currentQuestion[ID]}. currentQuestion = ${currentQuestion}`)
					if (!back) sess.message_history_stack.push(message.currentQuestion[ID])
					console.log(`router.realtime : session.message_history_stack = ${sess.message_history_stack}`)
					// sess.save()
					res = await compute(sess, res, currentQuestion, answers, nextQuestion, options, false, command, reset, patient_id, duration, customText, back)
					if (res === undefined) console.error('result is null or undefined')
					return res
				})
				// // Todo create result
				// console.log('new session, preparing result')
				// // computeAndReply()
				// console.log(getQuestionById(questions, nextQuestion))
				// // set res
				// res.json({
				// 	"none": "none",
				// 	question: getQuestionById(questions, nextQuestion),
				// 	incomingChats: [{ statement: { none: "none" }, type: "incoming" }]
				// });
				return res
			}
			console.log('new session created, pushing into DB')
			// push into new session
			console.log("session = ", session, ". message = ", message, ". session.messages = ", session.messages)
			// update session
			session.messages.push(message)
			// session.save()

			console.log('starting chat for new session')
			// begin computation and get result
			res = await compute(session, res, currentQuestion, answers, nextQuestion, null, true, command, reset, patient_id, duration, customText)
			return res
		})
});

router.get('/download/:fileUrl', (req, res) => {
	console.log(`download : req.params.fileUrl = ${req.params.fileUrl}`)
	console.log(`download : fileUrl path = ${/*path.join(__dirname) + */"../data/" + req.params.fileUrl}`)
	res.sendFile(path.resolve("./data/" + req.params.fileUrl), function (err) {
		if (err) {
			console.log(`Failed to send file : name = ${"../data/" + req.params.fileUrl}`);
			console.error(err)
		} else {
			console.log(`compute.prepareResult.sendfile : filename = ${"../data/" + req.params.fileUrl}`);
		}
	});
})

/**
 * Payment and disclaimer. Chat opening
 */
router.get('/questions', (req, res) => {
	/* TODO: doctor's availability status and welcome message */
	Doctor.find({}, (err, doctors) => {
		if (err || !doctors) return res.json({});

		let hospitals = [];
		let paymentDetails = []; // Associated with hospitals array indexes
		doctors.map((doctor) => {
			if (!hospitals.includes(doctor.hospital)) {
				hospitals.push(doctor.hospital);
				if (doctor.upi_id && doctor.fees) {
					paymentDetails.push("UPI: " + doctor.upi_id + " - Fees: " + doctor.fees + "/-");
				} else {
					paymentDetails.push("");
				}
			}
			return doctor;
		});

		res.json({
			/**
			 * the 'choose hospital' question
			 * has to be given options of hospitals dynamically
			 */
			questions: questions.map((question) => {
				if (question.id === 26) {
					return {
						...question,
						options: hospitals.map((hospital, index) => {
							let paymentDetail = paymentDetails[index] ? " - " + paymentDetails[index] : "";
							return {
								nextQuestion: hospital === 'AIIMS Jodhpur' ? 27 : 26.1,
								value: index,
								statement: {
									en: hospital + paymentDetail,
									hi: hospital + paymentDetail,
									bn: hospital + paymentDetail
								},
								dbValue: hospital
							};
						})
					};
				} else if (typeof question.id == "string") {
					return question;
				} else return question;
			}),
			incomingChats: [
				{
					statement: {
						en: 'We welcome you 🙏👩‍⚕️',
						hi: 'आपका स्वागत है 🙏👩‍⚕️',
						bn: 'আপনি স্বাগত জানাই 🙏👩‍⚕️'
					},
					type: 'incoming'
				}
			]
		});
	});
});

/* Doctor */
/**
 * Provides patient list for doctor's interface
 */
router.get('/patient-list', authenticate, (req, res) => {
	const { username: doctor } = req.user;

	Patient.find(
		{ doctor },
		null,
		{
			sort: { last_messaged_at: -1 }
		},
		(err, patients) => {
			if (err) return res.json({ error: true });

			const filteredPatients = patients.map(({ _doc: patient }) => {

				const {
					_id,
					name,
					age,
					gender,
					telephone,
					hospital,
					timestamps,
					ip,
					doctor,
					village,
					symptoms,
					symptoms_Duration,
					BP_systolic,
					BP_diastolic,
					SPO2_value,
					heart_rate,
					followup,
					created_at,
					last_messaged_at,
					latitude,
					longitude,
					BP_Image,
					Spo2_Image,
					ECG_Image,
					chat,
					prescriptions,
					diagnosis,
					behavior,
					pastHistory,
					advice,
					specialRemark,
					Visit
				} = patient;
				const formattedChat = chat.map(({ statement, type, timestamp }) => ({
					statement,
					type,
					timestamp: new Date(timestamp).toLocaleString()
				}));
				return {
					_id,
					name,
					age,
					gender,
					telephone,
					hospital,
					timestamps,
					ip,
					doctor,
					village,
					symptoms,
					symptoms_Duration,
					BP_systolic,
					BP_diastolic,
					SPO2_value,
					heart_rate,
					followup,
					'Last Visited': new Date(last_messaged_at).toLocaleString(),
					'Registered': new Date(created_at).toLocaleString(),
					latitude,
					longitude,
					BP_Image,
					Spo2_Image,
					ECG_Image,
					chat: formattedChat,
					prescriptions,
					diagnosis,
					behavior,
					pastHistory,
					advice,
					specialRemark,
					Visit
				};
			});

			res.json({ patients: filteredPatients });
		}
	);
});
router.get('/patient-listexcel', authenticate, async (req, res) => {
	const { username: doctor } = req.user;

	try {
		// Fetch patients from the `Patient` collection
		const patients = await Patient.find({ doctor }).sort({ last_messaged_at: -1 }).exec();

		// Fetch all follow-up records from `FollowUpPatient`
		const followUpPatients = await FollowUpPatient.find({
			id: { $in: patients.map(p => p._id.toString()) },
		}).exec();

		// Create a map to group follow-up data by patient ID
		const followUpMap = followUpPatients.reduce((acc, followUp) => {
			const key = followUp.id;
			if (!acc[key]) acc[key] = [];
			acc[key].push({
				...followUp._doc,
				chat: followUp.chat.map(({ statement, type, timestamp }) => ({
					statement,
					type,
					timestamp: new Date(timestamp).toLocaleString(),
				})),
				'Last Visited': new Date(followUp.last_messaged_at).toLocaleString(),
				'Registered': new Date(followUp.created_at).toLocaleString(),
			});
			return acc;
		}, {});

		// Combine patient data with their follow-ups
		const groupedPatients = patients.flatMap(patient => {
			const {
				_id,
				name,
				age,
				gender,
				telephone,
				hospital,
				timestamps,
				ip,
				doctor,
				village,
				symptoms,
				symptoms_Duration,
				BP_systolic,
				BP_diastolic,
				SPO2_value,
				heart_rate,
				followup,
				created_at,
				last_messaged_at,
				latitude,
				longitude,
				BP_Image,
				Spo2_Image,
				ECG_Image,
				chat,
				prescriptions,
				diagnosis,
				behavior,
				pastHistory,
				advice,
				specialRemark,
				Visit,
			} = patient._doc;

			const formattedChat = chat.map(({ statement, type, timestamp }) => ({
				statement,
				type,
				timestamp: new Date(timestamp).toLocaleString(),
			}));

			const followUps = followUpMap[_id.toString()] || [];

			return [
				{
					...patient._doc,
					chat: formattedChat,
					'Last Visited': new Date(last_messaged_at).toLocaleString(),
					'Registered': new Date(created_at).toLocaleString(),
				},
				...followUps,
			];
		});

		res.json({ patients: groupedPatients });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: 'Internal server error' });
	}
});
router.get('/allpatient-listexcel', async (req, res) => {

	try {
		// Fetch patients from the `Patient` collection
		const patients = await Patient.find().sort({ last_messaged_at: -1 }).exec();

		// Fetch all follow-up records from `FollowUpPatient`
		const followUpPatients = await FollowUpPatient.find({
			id: { $in: patients.map(p => p._id.toString()) },
		}).exec();

		// Create a map to group follow-up data by patient ID
		const followUpMap = followUpPatients.reduce((acc, followUp) => {
			const key = followUp.id;
			if (!acc[key]) acc[key] = [];
			acc[key].push({
				...followUp._doc,
				chat: followUp.chat.map(({ statement, type, timestamp }) => ({
					statement,
					type,
					timestamp: new Date(timestamp).toLocaleString(),
				})),
				'Last Visited': new Date(followUp.last_messaged_at).toLocaleString(),
				'Registered': new Date(followUp.created_at).toLocaleString(),
			});
			return acc;
		}, {});

		// Combine patient data with their follow-ups
		const groupedPatients = patients.flatMap(patient => {
			const {
				_id,
				name,
				age,
				gender,
				telephone,
				hospital,
				timestamps,
				ip,
				doctor,
				village,
				symptoms,
				symptoms_Duration,
				BP_systolic,
				BP_diastolic,
				SPO2_value,
				heart_rate,
				followup,
				created_at,
				last_messaged_at,
				latitude,
				longitude,
				BP_Image,
				Spo2_Image,
				ECG_Image,
				chat,
				prescriptions,
				diagnosis,
				behavior,
				pastHistory,
				advice,
				specialRemark,
				Visit,
			} = patient._doc;

			const formattedChat = chat.map(({ statement, type, timestamp }) => ({
				statement,
				type,
				timestamp: new Date(timestamp).toLocaleString(),
			}));

			const followUps = followUpMap[_id.toString()] || [];

			return [
				{
					...patient._doc,
					chat: formattedChat,
					'Last Visited': new Date(last_messaged_at).toLocaleString(),
					'Registered': new Date(created_at).toLocaleString(),
				},
				...followUps,
			];
		});
		console.log(patients)
		res.json({ patients: groupedPatients });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: 'Internal server error' });
	}
});
router.get('/allpatient-listexcel/:village', async (req, res) => {
	const{village}=req.params;
	try {
		// Fetch patients from the `Patient` collection
		const patients = await Patient.find({village:village}).sort({ last_messaged_at: -1 }).exec();

		// Fetch all follow-up records from `FollowUpPatient`
		const followUpPatients = await FollowUpPatient.find({
			id: { $in: patients.map(p => p._id.toString()) },
		}).exec();

		// Create a map to group follow-up data by patient ID
		const followUpMap = followUpPatients.reduce((acc, followUp) => {
			const key = followUp.id;
			if (!acc[key]) acc[key] = [];
			acc[key].push({
				...followUp._doc,
				chat: followUp.chat.map(({ statement, type, timestamp }) => ({
					statement,
					type,
					timestamp: new Date(timestamp).toLocaleString(),
				})),
				'Last Visited': new Date(followUp.last_messaged_at).toLocaleString(),
				'Registered': new Date(followUp.created_at).toLocaleString(),
			});
			return acc;
		}, {});

		// Combine patient data with their follow-ups
		const groupedPatients = patients.flatMap(patient => {
			const {
				_id,
				name,
				age,
				gender,
				telephone,
				hospital,
				timestamps,
				ip,
				doctor,
				village,
				symptoms,
				symptoms_Duration,
				BP_systolic,
				BP_diastolic,
				SPO2_value,
				heart_rate,
				followup,
				created_at,
				last_messaged_at,
				latitude,
				longitude,
				BP_Image,
				Spo2_Image,
				ECG_Image,
				chat,
				prescriptions,
				diagnosis,
				behavior,
				pastHistory,
				advice,
				specialRemark,
				Visit,
			} = patient._doc;

			const formattedChat = chat.map(({ statement, type, timestamp }) => ({
				statement,
				type,
				timestamp: new Date(timestamp).toLocaleString(),
			}));

			const followUps = followUpMap[_id.toString()] || [];

			return [
				{
					...patient._doc,
					chat: formattedChat,
					'Last Visited': new Date(last_messaged_at).toLocaleString(),
					'Registered': new Date(created_at).toLocaleString(),
				},
				...followUps,
			];
		});
		console.log(patients)
		res.json({ patients: groupedPatients });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: 'Internal server error' });
	}
});
router.post("/add-patient", async (req, res) => {
	try {
		const { name, age, gender, telephone } = req.body;
		const _id = getId(name, telephone)
		const newPatient = await Patient.create({
			_id,
			name,
			age,
			gender,
			telephone,
			Visit:1,
			followup:1,
		})
		res.status(201).json({
			success: true,
			message: "Patient added successfully",
			patient: newPatient,
		});
	}
	catch (err) {
		console.log(err);
	}
})

router.put('/update-patient/:patientId/:visit', async (req, res) => {
	const { patientId, visit } = req.params;
	const updatedPatientData = req.body;  // Get updated patient data from the request body
	console.log
	try {
		if (visit > 1) {
			const patient = await FollowUpPatient.findOne({ id: patientId, Visit: visit });

			if (!patient) {
				return res.status(404).json({ message: 'Patient not found' });
			}

			// Update patient fields with the new data (set defaults if not provided)
			patient.name = updatedPatientData.name || patient.name;
			patient.age = updatedPatientData.age || patient.age;
			patient.gender = updatedPatientData.gender || patient.gender;
			patient.telephone = updatedPatientData.telephone || patient.telephone;
			patient.hospital = updatedPatientData.hospital || patient.hospital;
			patient.doctor = updatedPatientData.doctor || patient.doctor;
			patient.village = updatedPatientData.village || patient.village;
			patient.symptoms = updatedPatientData.symptoms || patient.symptoms;
			patient.symptomsDuration = updatedPatientData.symptomsDuration || patient.symptomsDuration;
			patient.followUp = updatedPatientData.followUp || patient.followUp;
			patient.lastVisited = updatedPatientData.lastVisited || patient.lastVisited;
			patient.registered = updatedPatientData.registered || patient.registered;
			patient.latitude = updatedPatientData.latitude || patient.latitude;
			patient.longitude = updatedPatientData.longitude || patient.longitude;
			patient.bpSystolic = updatedPatientData.bpSystolic || patient.bpSystolic;
			patient.bpDiastolic = updatedPatientData.bpDiastolic || patient.bpDiastolic;
			patient.spo2 = updatedPatientData.spo2 || patient.spo2;
			patient.heartRate = updatedPatientData.heartRate || patient.heartRate;
			patient.prescription = updatedPatientData.prescription || patient.prescription;
			patient.pastHistory = updatedPatientData.pastHistory || patient.pastHistory;
			patient.advice = updatedPatientData.advice || patient.advice;
			patient.diagnosis = updatedPatientData.diagnosis || patient.diagnosis;
			patient.behavior = updatedPatientData.behavior || patient.behavior;

			// Handle the visit parameter, assuming it needs to be saved for the visit record
			patient.visit = visit || patient.visit;

			// Save the updated patient data
			await patient.save();

			return res.status(200).json({ message: 'Patient updated successfully', patient });
		}
		const patient = await Patient.findById(patientId);

		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}

		// Update patient fields with the new data (set defaults if not provided)
		patient.name = updatedPatientData.name || patient.name;
		patient.age = updatedPatientData.age || patient.age;
		patient.gender = updatedPatientData.gender || patient.gender;
		patient.telephone = updatedPatientData.telephone || patient.telephone;
		patient.hospital = updatedPatientData.hospital || patient.hospital;
		patient.doctor = updatedPatientData.doctor || patient.doctor;
		patient.village = updatedPatientData.village || patient.village;
		patient.symptoms = updatedPatientData.symptoms || patient.symptoms;
		patient.symptomsDuration = updatedPatientData.symptomsDuration || patient.symptomsDuration;
		patient.followUp = updatedPatientData.followUp || patient.followUp;
		patient.lastVisited = updatedPatientData.lastVisited || patient.lastVisited;
		patient.registered = updatedPatientData.registered || patient.registered;
		patient.latitude = updatedPatientData.latitude || patient.latitude;
		patient.longitude = updatedPatientData.longitude || patient.longitude;
		patient.bpSystolic = updatedPatientData.bpSystolic || patient.bpSystolic;
		patient.bpDiastolic = updatedPatientData.bpDiastolic || patient.bpDiastolic;
		patient.spo2 = updatedPatientData.spo2 || patient.spo2;
		patient.heartRate = updatedPatientData.heartRate || patient.heartRate;
		patient.prescription = updatedPatientData.prescription || patient.prescription;
		patient.pastHistory = updatedPatientData.pastHistory || patient.pastHistory;
		patient.advice = updatedPatientData.advice || patient.advice;
		patient.diagnosis = updatedPatientData.diagnosis || patient.diagnosis;
		patient.behavior = updatedPatientData.behavior || patient.behavior;

		// Handle the visit parameter, assuming it needs to be saved for the visit record
		patient.visit = visit || patient.visit;

		// Save the updated patient data
		await patient.save();

		return res.status(200).json({ message: 'Patient updated successfully', patient });

	} catch (error) {
		console.error('Error updating patient:', error);
		return res.status(500).json({ message: 'Error updating patient' });
	}
});


router.get('/followuppatient-list', authenticate, (req, res) => {
	const { patient_Id } = req.query;

	FollowUpPatient.find({ id: patient_Id }, (err, patients) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ message: 'Error fetching patients' });
		}

		// Transform patients to include the desired fields
		const transformedPatients = patients.map(patient => ({
			...patient.toObject(), // Convert MongoDB document to plain object
			'Last Visited': new Date(patient.last_messaged_at).toLocaleString(),
			'Registered': new Date(patient.created_at).toLocaleString(),
		}));

		return res.json({ patients: transformedPatients });
	});
});


router.get('/all-patients', authenticate, (req, res) => {
	const { username: doctor } = req.user;

	Patient.find(
		{ doctor },
		null,
		{
			sort: { last_messaged_at: -1 }
		},
		(err, patients) => {
			if (err) return res.status(500).json({ error: true, message: 'Error retrieving patients' });


			const allPatients = patients.map(({ _doc: patient }) => {

				const { created_at, last_messaged_at, chat } = patient;


				const formattedChat = chat.map(({ statement, type, timestamp }) => ({
					statement,
					type,
					timestamp: new Date(timestamp).toLocaleString()
				}));

				return {
					...patient,
					chat: formattedChat,
					'Last Visited': new Date(last_messaged_at).toLocaleString(),
					Registered: new Date(created_at).toLocaleString()
				};
			});

			res.json({ patients: allPatients });
		}
	);
});


/**
 * Used by doctor to get other doctors
 * of the same hospital he can refer the same patient to
 */
router.get('/doctor-list', authenticate, (req, res) => {
	const { hospital, username } = req.user;
	console.log("hospital", hospital, "username", username)
	Doctor.find({ hospital, username: { $ne: username } }, (err, doctors) => {
		if (err) return res.json({ error: true });
		res.json({
			doctors
		});
	});
});
/**
 * doctors logout
 */
router.get('/logout', authenticate, (req, res) => {
	// req.session.destroy();
	req.session.username = null;
	res.json({ loggedOut: true });
});

/**
 * doctors login
 */
router.post('/login', authenticate, (req, res) => {
	const { username, hospital, _id } = req.user;
	res.json({ login: true, username, hospital, doctorId: _id });
});

router.get('/snomed-ct', authenticate, async (req, res) => {
	const { term } = req.body;

	try {
		// SNOWSTORM_URL='http://localhost:8080/MAIN/concepts'
		// must be set in .env file

		if (!process.env.SNOWSTORM_URL) {
			throw new Error('SNOWSTORM_URL not set in .env file');
		}

		let response = await axios.get(process.env.SNOWSTORM_URL, {
			params: {
				term: term,
			},
		});

		return res.json(response.data);
	} catch (error) {
		console.error('Error fetching SNOMED CT terms: ', error);

		const status = error.response ? error.response.status : 500;
		const message = error.response ? error.response.data : 'No response received from SNOMED CT server';

		return res.status(status).json({ message });
	}
});

router.get('/Alldoctor-list', async (req, res) => {
	try {
		const doctors = await Doctor.find({});
		res.json({ doctors });
	} catch (err) {
		console.error('Error fetching doctors:', err);
		res.status(500).json({ error: true, message: 'Failed to fetch doctors' });
	}
});

router.post('/addpatient', async (req, res) => {
	try {
		const { id, name, number } = req.body;

		const existingPatient = await Patient.findById(id);
		if (existingPatient) {
			return res.status(200).json({ success: false, message: 'Patient ID already exists' });
		}

		const newPatient = new Patient({
			_id: id,
			name: name,
			telephone: number,
			Visit: 1,
			followup: 1,
		});
		await newPatient.save();
		res.status(200).json({ success: true, message: 'Patient added successfully' });
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed' });
	}
});
router.delete('/delete-patient/:id/:visit', async (req, res) => {
	const { id, visit } = req.params;

	try {
		if (visit > 1) {
			const deletedPatient = await FollowUpPatient.findOneAndDelete({ id: id, Visit: visit });
			const updatedPatient = await Patient.findByIdAndUpdate(
				id,
				{ $inc: { followup: -1 } }, // Decrement followUp by 1
				{ new: true } // Return the updated document
			);

			if (!deletedPatient) {
				return res.status(404).json({ message: 'Patient not found' });
			}

			return res.status(200).json({ message: 'Patient deleted successfully' });
		}
		const deletedPatient = await Patient.findByIdAndDelete(id);

		if (!deletedPatient) {
			return res.status(404).json({ message: 'Patient not found' });
		}

		res.status(200).json({ message: 'Patient deleted successfully' });
	} catch (error) {
		console.error('Error deleting patient:', error);
		res.status(500).json({ message: 'Error deleting patient', error });
	}
});

module.exports = router;
router.post('/seepatientchat', async (req, res) => {
	try {
		const { id, name, number, selectedDoctor } = req.body;

		const existingPatient = await Patient.findById(id);
		if (!existingPatient) {
			return res.status(200).json({ success: false, message: 'Patient ID not exists' });
		}
		console.log("sD", selectedDoctor)
		if (selectedDoctor !== existingPatient.doctor) {
			return res.status(200).json({ success: false, message: 'Chat with this Doctor do no exist' });
		}
		return res.status(200).json({ success: true, chat: existingPatient.chat });
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed' });
	}
});

router.post('/updatepatientdochos', async (req, res) => {
	try {
		const { patientId, selectedHospital, selectedDoctor } = req.body;
		const updatedPatient = await Patient.findByIdAndUpdate(
			patientId,
			{ $set: { hospital: selectedHospital, doctor: selectedDoctor } },
			{ new: true, runValidators: true }
		);
		// const updatedDoctor = await Doctor.findOneAndUpdate(
		//     { username: selectedDoctor },  // Find by doctor name instead of ObjectId
		//     { $set: { attending: patientId } },
		//     { new: true, runValidators: true }
		// );

		if (!updatedPatient && !updatedDoctor) {
			return res.status(404).json({ success: false, message: 'Patient not found' });
		}

		res.status(200).json({ success: true, message: 'Patient updated successfully', patient: updatedPatient });
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed to update patient' });
	}
});

router.post('/saveERX', async (req, res) => {
	try {
		const {
			patient_Id,
			pastHistory,
			diagnosis,
			advice,
			specialRemark,
			prescriptions,
			behavior } = req.body;

		const updatedPatient = await Patient.findByIdAndUpdate(
			patient_Id,
			{ $set: { pastHistory: pastHistory, diagnosis: diagnosis, advice: advice, specialRemark: specialRemark, prescriptions: prescriptions, behavior: behavior } },
			{ new: true, runValidators: true }
		);

		res.status(200).json({ success: true, message: 'Patient updated successfully', patient: updatedPatient });
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed to update patient' });
	}
});
router.post('/saveFollowupERX', async (req, res) => {
	try {
		const {
			patient_Id,
			index,
			pastHistory,
			diagnosis,
			advice,
			specialRemark,
			prescriptions,
			behavior,
		} = req.body;

		const updatedPatient = await FollowUpPatient.findOneAndUpdate(
			{ id: patient_Id, followup: index }, // Add the followup condition
			{
				$set: {
					pastHistory,
					diagnosis,
					advice,
					specialRemark,
					prescriptions,
					behavior,
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedPatient) {
			return res.status(404).json({
				success: false,
				message: 'No matching patient found with the specified conditions',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Patient updated successfully',
			patient: updatedPatient,
		});
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed to update patient' });
	}
});

const upload2 = multer({ storage });

// Fetch doctor credentials
router.get('/doctor/:id', async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
		res.status(200).json(doctor);
	} catch (err) {
		res.status(500).json({ message: 'Error fetching doctor', error: err.message });
	}
});

// Update doctor credentials
router.put('/doctor/:id', upload2.single('signature'), async (req, res) => {
	try {
		const { name, degree, regNO } = req.body;
		const updateData = { name, degree, regNO };

		if (req.file) {
			const signaturePath = `/aa/images/${req.file.filename}`;
			updateData.signature = signaturePath;
		}

		const updatedDoctor = await Doctor.findByIdAndUpdate(
			req.params.id,
			{ $set: updateData },
			{ new: true, runValidators: true }
		);

		if (!updatedDoctor) return res.status(404).json({ message: 'Doctor not found' });
		res.status(200).json(updatedDoctor);
	} catch (err) {
		res.status(500).json({ message: 'Error updating doctor', error: err.message });
	}
});

router.post('/nurseregister', async (req, res) => {
	const { username, password, village} = req.body;
	try {
		const existingNurse = await Nurse.findOne({ username });
		if (existingNurse) {
			return res.status(400).json({ message: 'Username already exists' });
		}
		const nurse = new Nurse({ username, password, village});
		await nurse.save();
		res.status(201).json({ message: 'Registration successful' });
	} catch (error) {
		res.status(500).json({ error: 'An error occurred during registration' });
	}
});

// Nurse login
router.post('/nurselogin', async (req, res) => {
	const { username, password } = req.body;
	try {
		const nurse = await Nurse.findOne({ username });
		if (password !== nurse.password) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		console.log(nurse.village)
		res.status(200).json({ message: 'Login successful', village: nurse.village });
	} catch (error) {
		console.log(error)
		res.status(500).json({ error: 'An error occurred during login' });
	}
});

module.exports = router;
