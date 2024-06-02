const Doctor = require('../models/doctor');

authenticate = async (req, res, next) => {
	if (req.session.username) {
		Doctor.findOne({ username: req.session.username }, (err, doctor) => {
			if (err) return res.json({});
			if (!doctor) {
				// req.session.destroy();
				req.session.username = null;
				res.json({});
			} else {
				req.user = doctor._doc;
				next();
			}
		});
	} else {
		const { username, password } = req.body;
		console.log(username, password);
		Doctor.findOne({ username, password }, (err, doctor) => {
			if (err || !doctor) {
				console.error(err);
				return res.json({});
			}
			req.session.username = username;
			req.user = doctor._doc;
			next();
		});
	}
};

module.exports = authenticate;
