const express = require('express');

const Doctor = require('../models/doctor');
const Admin = require('../models/admin');
const Patient = require('../models/patient');

const { mail } = require('../helper/mail');

const router = express.Router();
/**
 * Middleware used for loading session through cookies
 */
router.use((req, res, next) => {
	if (req.session.admin_username) {
		Admin.findOne({ username: req.session.admin_username }, (err, admin) => {
			if (err) return res.json({});
			else if (!admin) {
				// req.session.destroy();
				req.session.admin_username = null;
				return res.json({ error: 'EXPIRED' });
			} else {
				req.user = admin._doc;
				next();
			}
		});
	} else {
		const { username, password } = req.body;
		Admin.findOne({ username, password }, (err, admin) => {
			if (err || !admin) return res.json({ error: 'INVALID CREDENTIALS' });
			req.session.admin_username = username;
			req.user = admin._doc;
			next();
		});
	}
});
/**
 * Update details of doctor identified by id given in url param
 * by the POST body enclosed
 */
router.post('/doctor/:id', (req, res) => {
	const { username, password, hospital, telephone, email, name, post, department, upi_id, fees } = req.body;
	const { id } = req.params;
	Doctor.findByIdAndUpdate(
		id,
		{
			$set: {
				username,
				password,
				hospital,
				telephone,
				email,
				name,
				post,
				department,
				upi_id,
				fees
			}
		},
		(err) => {
			if (err) console.error(err);
			res.json({});
		}
	);
});

/**
 * Delete a doctor identified by id given in url param
 */
router.delete('/doctor/:id', (req, res) => {
	const { id } = req.params;
	Doctor.findByIdAndDelete(id, (err) => {
		if (err) console.error(err);
		res.json({});
	});
});
/**
 * Create a doctor document
 */
router.put('/doctor', (req, res) => {
	const { username, password, hospital, telephone, email, name, post, department, upi_id, fees } = req.body;
	Doctor.create(
		{
			username,
			password,
			hospital,
			telephone,
			email,
			name,
			post,
			department,
			upi_id,
			fees,
			created_at: Date.now()
		},
		(err) => {
			if (err) {
				console.error(err);
				return res.json({});
			}

			mail(
				username,
				'Account Confirmation : telemedicine.iitj.ac.in for online consultancy',
				`
We welcome you to our Tele Consultancy Platform CoViDoc. We quickly brief you here about the platform:

You can access the portal by using your username and password at https://telemedicine.iitj.ac.in/doctor portal.

username: ${username}
password: ${password}

1. http://telemedicine.iitj.ac.in is a portal developed by Software Innovation Lab at IIT Jodhpur
2. The portal lets patients select the hospital and enter some basic details with a general set of questions to initiate a request for consultancy.
3. Once a patient agrees to consult a doctor, it connects the doctor via chat interface. ( Audio / Video support coming soon )
4. The platform also allows doctors to refer the cases to another consultant and also sends an automated alert to the concerned consultant via email.
5. The platform also takes care of the revisit of a patient and shows the last chat history to the doctors.
6. We also have an Android Mobile App for patients on Google Play Store. For doctors, it's coming soon.
7. The portal's main interface is in Hindi. We are also planning to support other Indian languages.

In case, if you need any assistance, please feel free to reach us. We will look forward for your support and feedback to continuously improve our system.

We hope that this platform will be useful in the current lockdown scenario as well as for providing telemedicine services to remote areas.
`
			);
			res.json({});
		}
	);
});

router.get('/doctor-list', (req, res) => {
	const { page } = req.query;
	const pageSize = 30;
	Doctor.find(
		{},
		{},
		{
			limit: pageSize,
			skip: pageSize * Math.max(0, page - 1),
			sort: {
				created_at: -1
			}
		},
		(err, doctors) => {
			if (err) return res.json({ error: true });
			res.json({
				doctors
			});
		}
	);
});
/**
 * Gives all the chats to be used in AI models.
 */
router.get('/chats', (req, res) => {
	Patient.find({}, { chat: 1 }, (err, chats) => {
		if (err || !chats) return res.json({ error: true });
		res.json({ chats });
	});
});
/**
 * admin logout
 */
router.get('/logout', (req, res) => {
	// req.session.destroy();
	req.session.admin_username = null;
	res.json({ loggedOut: true });
});
/**
 * admin login
 */
router.post('/login', (req, res) => {
	console.log("admin/login")
	const { username } = req.user;
	res.json({ login: true, username });
});

module.exports = router;
