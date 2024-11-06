const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/');
	},
	filename: function (req, file, cb) {
		const name = file.originalname.split('.');
		const customFileName = crypto.randomBytes(18).toString('hex');
		const extension = name[name.length - 1];
		cb(null, customFileName + '.' + extension);
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

	const oldPatient = answers['23'] === 1
		? getId(answers['24'], answers['25'])												// else oldPatient = name and phone entered
		: null 																										// if new consultation : oldPatient = null

	console.log("assessment started. oldPatient = ", oldPatient)
	console.log(`answers['23'] = ${answers['23']}. answers['2.5'] = ${answers['2.5']}. (answers['23'] === 0 || answers['2.5'] !== 'undefined') = ${(answers['23'] === 0 || answers['2.5'] !== 'undefined')}
	 answers['24'] = ${answers['24']}. answers['25'] = ${answers['25']}. ID = ${() => {
			if (answers['23'] === 1) getId(answers['24'], answers['25']); else getId(answers['2.5'], answers['2.8'])
		}}
	 answers = ${'pass'/*JSON.stringify(answers)*/}`
	)

	if (oldPatient) {
		console.log('routes /assessment() oldPatient')
		// TODO : add sessions
		console.log(oldPatient);
		Patient.findById(oldPatient, async (err, patient) => {
			if (err || !patient) {
				console.log(err, patient)
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

			const { _id, doctor, name, telephone } = patient;
			// mail(
			// 	doctor,
			// 	'Your Patient is Online',
			// 	`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
			// );
			console.log('routes /assessment creating session for new patient')
			// patient.conversation_sessions.push(conversation_session_id)
			const doctorModel = await Doctor.findOne({ username: doctor });
			if (doctorModel.status === 'idle' || doctorModel.status === 'online') {
				patient.followup = (patient.followup || 0) + 1;
				patient.chat.push({
					statement: "session-closed",
					type: 'incoming',
				});
				await patient.save();
				res.json({
					connectToDoctor: true,
					patientId: _id,
					// incomingChats: patient.chat,
					question: questions[questions.length - 1]
				});
			}
			else {
				return res.json({
					incomingChats: [
						{
							statement: {
								en: "The doctor is currently unavailable, but you can view your chat history by clicking the chat icon next to the doctor 🙁",
								hi: "डॉक्टर इस समय उपलब्ध नहीं हैं, लेकिन आप डॉक्टर के पास चैट आइकन पर क्लिक करके अपनी चैट हिस्ट्री देख सकते हैं 🙁",
								bn: "ডাক্তার বর্তমানে উপলব্ধ নেই, তবে আপনি ডাক্তারের পাশে চ্যাট আইকনে ক্লিক করে আপনার চ্যাট ইতিহাস দেখতে পারেন 🙁"
							},
							type: 'incoming'
						}
					]
				});
			}
		});
		// TODO : add self screening here and link to consultation. Save data before adding user
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
					"Ramniya-Kathadi",
					"Ramniya-Mangi",
					"Ramniya-Dhira",
					"Ramniya-Bhagva",
					"Ramniya-Telvada",
					"Ramniya-Raghunath Gad",
					"Ramniya-Dharbahlo Ki Dhani",
					"Siner-Dharna",
					"Siner-Anpurna Nagar",
					"Siner-Guda"
				];

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
						symptoms: [answers['2.4']],
						symptoms_Duration: answers['2.41'],
						followup: 1,
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
		{ chat: 0, last_notified_at: 0, __v: 0, chat_id: 0 },
		{
			sort: {
				last_messaged_at: -1
			}
		},
		(err, patients) => {
			if (err) return res.json({ error: true });
			
			res.json({
				patients: patients.map(({ _doc: patient }) => {
					const { created_at, last_messaged_at } = patient;
					delete patient['created_at'];
					delete patient['last_messaged_at'];
					patient['Last Visited'] = new Date(last_messaged_at).toLocaleString();
					patient['Registered'] = new Date(created_at).toLocaleString();
					return patient;
				})
			});
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
			telephone: number
		});
		await newPatient.save();
		res.status(200).json({ success: true, message: 'Patient added successfully' });
	} catch (err) {
		console.error('Error:', err);
		res.status(500).json({ error: true, message: 'Failed' });
	}
});
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



module.exports = router;
