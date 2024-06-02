const debug = require('debug')('server:server');

const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const nsp = '/app_chat:'
// seems like doctor patient conversation

const { mail, mailPatient } = require('../helper/mail');
// const { io } = require("../bin/www");

Patient.updateMany({}, { $set: { chat_id: '' } }, (err, res) => {
	if (err) return console.error('updating many patients. setting chat_id', err);
});

function giveDoctorAPatient(username, patientId, live_chat) {
	console.log('chat/index.js giveDoctorAPatient()')
	Doctor.findOneAndUpdate({ username }, { $set: { attending: patientId } }, (err, doctor) => {
		if (err || !doctor) return console.error(err);
		const { chat_id } = doctor;
		if (chat_id) {
			Patient.findById(patientId, (err, patient) => {
				if (err || !patient || !patient.chat) return console.error('chat.index.giveDoctorAPatient().findByIdError : ', err);
				const { chat } = patient;
				live_chat.to(chat_id).emit('userAlloted', { patientId, chat });
			});
		}
	});
}

function doctorFree(username, hospital, live_chat) {
	console.log(`doctorFree() live_chat = ${live_chat}`)
	Patient.find(
		{ doctor: username, hospital, chat_id: { $ne: '' } },
		{},
		{ limit: 1, sort: { created_at: 1 } },
		(err, patients) => {
			if (err || !patients) return console.error(err);
			if (patients[0]) {
				const { _id } = patients[0];
				giveDoctorAPatient(username, _id, live_chat);
			}
		}
	);
}

function enterPatient(patientId, hospital, username, live_chat) {
	console.log('chat.index enterPatient()')
	Doctor.findOne(
		{
			username,
			// attending: '',
			hospital,
			chat_id: { $ne: '' }
		},
		(err, doctor) => {
			if (err || !doctor) return console.error('chat.index.enterPatient().findError : ', err);
			giveDoctorAPatient(username, patientId, live_chat);
		}
	);
}

function getPatientSocketById(patientId, callback) {
	Patient.findById(patientId, (err, patient) => {
		if (err || !patient) callback(null);
		else callback(patient.chat_id);
	});
}

function getDoctorSocketById(username, callback) {
	Doctor.findOne({ username }, (err, doctor) => {
		if (err || !doctor) callback(null);
		else callback(doctor.chat_id);
	});
}

function disconnectPatient(id) {
	Patient.findByIdAndUpdate(id, { $set: { chat_id: '' } }, (err, res) => {});
}

let online_user_count = 0;

const makeChatNameSpace = (live_chat) => {
	console.log(`makeChatNameSpace() live_chat = ${live_chat}`)

	live_chat.on('any', ()=>console.log("LOG socket.io any"))

	live_chat.on('connection', function (socket) {
	/* Manage the count of online users. */
	console.log('LOG socket.io chat.index : connection established for chat')
	online_user_count = online_user_count + 1;
	live_chat.emit('onlineUsers', online_user_count);

	const { type, patientId, username } = socket.handshake.query;
	console.log('chat.index.socket_live_chat.on.connection. Type - ', type, 'client - ', type === 'patient' ? patientId : username, 'connected');

	if (type === 'doctor' && username) {
		console.log('chat.index.socket_live_chat.on.connection.doctor')
		Doctor.findOneAndUpdate({ username }, { $set: { chat_id: socket.id } }, (err, doctor) => {
			if (err || !doctor) return socket.disconnect();
			else {
				if (!doctor.attending) doctorFree(username, doctor.hospital, live_chat);
				else {
					giveDoctorAPatient(username, doctor.attending, live_chat);
				}
			}
		});
	}
	else if (type === 'patient' && patientId) {
		console.log('chat.index.socket_live_chat.on.connection.patient')
		Patient.findByIdAndUpdate(patientId, { $set: { chat_id: socket.id } }, (err, patient) => {
			if (err || !patient) return socket.disconnect();
			else {
				const { doctor, hospital } = patient;
				if (doctor) {
					socket.emit('doctorAlloted', doctor);
					enterPatient(patientId, hospital, doctor, live_chat);
				} else {
					socket.disconnect();
				}
			}
		});
	}
	else {
		console.log('chat.index.socket_live_chat.on.connection : incomplete information')
		socket.disconnect();
	}

	/* from doctor to patient */
	socket.on('disconnectUser', () => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.disconnectUser')
		socket.emit('userDisconnected');

		Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
			if (err || !doctor) return console.error(err);
		});
	});

	socket.on('changePatient', (patient) => {
		console.log('chat.index.socket.on.change patient')
		giveDoctorAPatient(username, patient, live_chat);
	});

	socket.on('referUser', ({ doctorSelected, patientId }) => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.referUser')
		Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
			if (err || !doctor) return console.error(err);
			socket.emit('userDisconnected');
			const { name: doctorsname } = doctor;
			Patient.findByIdAndUpdate(patientId, { $set: { doctor: doctorSelected } }, (err, patient) => {
				if (err || !patient) return console.error(err);
				const { name: patientsname, telephone, chat_id } = patient;
				mail(
					doctorSelected,
					'New Patient',
					`Patient ${patientsname}, ${telephone}, was reffered to you by ${doctorsname}.`
				);
				if (chat_id) {
					socket.to(chat_id).emit('message', 'आपके परामर्श को किसी अन्य चिकित्सक को भेजा जाता है');
					socket.to(chat_id).emit('referUser', doctorSelected);
					enterPatient(patient._id, patient.hospital, doctorSelected, live_chat);
				}
			});
		});
	});

	/* common */
	socket.on('message', ({ message, to }) => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.Message')
		if (type === 'doctor') {
			// sent by doctor
			Patient.findById(to, (err, patient) => {
				if (err || !patient) return console.error(err);

				const { chat_id, _id } = patient;
				if (!chat_id) {
					const { last_messaged_at = Date.now() + 2000, last_notified_at = Date.now() } = patient;
					if (last_messaged_at > last_notified_at) {
						mailPatient(
							_id,
							'डॉक्टर से संदेश!',
							'डॉक्टर ने हाल ही में आपको संदेश भेजे हैं, कृपया http://telemedicine.iitj.ac.in पर अपना परामर्श जारी रखें'
						);
					}
				} else {
					// sent by patient
					socket.to(chat_id).emit('message', { message, from: username });
					patient.last_notified_at = Date.now();
				}
				patient.chat.push({
					statement: message,
					type: 'incoming'
				});
				patient.save((err) => {
					if (err) console.error(err);
				});
			});
		} else {
			Patient.findById(patientId, (err, patient) => {
				if (err || !patient) return console.error(err);
				getDoctorSocketById(patient.doctor, (doctor_chat_id) => {
					if (doctor_chat_id) {
						socket.to(doctor_chat_id).emit('message', { message, from: patientId });
					}
				});
				patient.chat.push({
					statement: message,
					type: 'outgoing'
				});
				patient.last_messaged_at = Date.now();
				patient.save((err) => {
					if (err) console.error(err);
				});
			});
		}
	});

	socket.on('typingChange', ({ state, to }) => {
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id)
					socket.to(patient_chat_id).emit('typingChange', { state, from: username });
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id)
					socket.to(doctor_chat_id).emit('typingChange', { state, from: patientId });
			});
		}
	});

	socket.on('request', (to) => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.Request')
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('request', username);
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('request', patientId);
			});
		}
	});

	socket.on('call', ({ data, to }) => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.Call')
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('call', { data, from: username });
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('call', { data, from: patientId });
			});
		}
	});

	socket.on('end', (to) => {
		console.log('chat.index.socket_live_chat.on.connection.socket.on.End')
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('end', username);
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('end', patientId);
			});
		}
	});

	socket.on('disconnect', () => {
		console.log(type, type === 'patient' ? patientId : username, 'disconnected');

		if (type === 'patient' && patientId) {
			disconnectPatient(patientId);
			Doctor.find({ attending: patientId }, (err, doctor) => {
				if (err || !doctor) return;
				getDoctorSocketById(doctor.username, (doctor_chat_id) => {
					live_chat.to(doctor_chat_id).emit('end', patientId);
				});
			});
		} else if (type === 'doctor' && username) {
			Doctor.findOneAndUpdate(
				{ username },
				{ $set: { attending: '', chat_id: '' } },
				(err, doctor) => {
					if (err || !doctor) return console.error(err);
					const { attending: prevAttending } = doctor;
					getPatientSocketById(prevAttending, (patient_chat_id) => {
						live_chat.to(patient_chat_id).emit('end', doctor.username);
					});
				}
			);
		}

		online_user_count = online_user_count - 1;
		live_chat.emit('onlineUsers', online_user_count);
	});
});

	return live_chat
}

module.exports.makeChatNameSpace = makeChatNameSpace