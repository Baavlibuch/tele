const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const Doctors = require('../models/doctor');
const Patient = require('../models/patient');

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	requireTLS: true,
	auth: {
		user: 'telemedicine.iitj@gmail.com',
		pass: 'temp@2020' // process.env.EMAIL_PASS
	}
});

module.exports.mailPatient = (patientId, subject, text) => {
	Patient.findByIdAndUpdate(patientId, { last_notified_at: Date.now() }, (err, patient) => {
		if (err || !patient) return console.error(err);

		const { email, name, telephone } = patient;

		// console.log(mailOptions);
		// console.log(
		// 	'https://www.fast2sms.com/dev/bulk?' +
		// 		'authorization='+process.env.FTS_AUTH+'&' +
		// 		'sender_id=FSTSMS&' +
		// 		'language=english&' +
		// 		'route=qt&' +
		// 		`numbers=${telephone}` +
		// 		`message=${text}&` +
		// 		'variables={AA}|{CC}' +
		// 		`variables_values=${telephone}|${name}`
		// );

		// if (telephone) {
		// 	fetch(
		// 		'https://www.fast2sms.com/dev/bulk?' +
		// 			'authorization='+process.env.FTS_AUTH+'&' +
		// 			'sender_id=FSTSMS&' +
		// 			'language=english&' +
		// 			'route=qt&' +
		// 			`numbers=${unescape(telephone)}` +
		// 			`message=${unescape(text)}&` +
		// 			'variables={AA}|{CC}' +
		// 			`variables_values=${unescape(telephone)}|${unescape(name)}`
		// 	)
		// 		.then((res) => res.json())
		// 		.then((res) => {
		// 			console.log(res);
		// 		})
		// 		.catch((err) => {
		// 			console.log(err);
		// 		});
		// }

		if (email) {
			const mailOptions = {
				from: 'telemedicine.iitj@gmail.com', // sender address
				to: email, // list of receivers
				subject,
				text: `Dear ${name},\n` + text
			};
			if (process.env.NODE_ENV === 'development') {
				console.log(mailOptions);
			} else {
				transporter.sendMail(mailOptions, function (err, info) {
					if (err) {
						console.log(err);
					} else {
						console.log(info);
					}
				});
			}
		}
	});
};

module.exports.mail = (username, subject, text) => {
	Doctors.findOne({ username }, (err, doctor) => {
		if (err || !doctor) return console.error(err);

		const { email, name } = doctor;
		const mailOptions = {
			from: 'telemedicine.iitj@gmail.com', // sender address
			to: email, // list of receivers
			subject,
			text: `Dear ${name},\n` + text
		};

		if (process.env.NODE_ENV === 'development') {
			console.log(mailOptions);
		} else {
			transporter.sendMail(mailOptions, function (err, info) {
				if (err) {
					console.log(err);
				} else {
					console.log(info);
				}
			});
		}
	});
};
