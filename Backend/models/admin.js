const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const AdminSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: String
});

// create the model
const Admin = mongoose.model('Admin', AdminSchema, 'admin');

// export the model
module.exports = Admin;
