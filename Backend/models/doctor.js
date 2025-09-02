const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const DoctorSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 1
	},
	hospital: {
		type: String,
		required: true,
		minlength: 1
	},
	/**
	 * attending field is used while doctor is online
	 * to get the patient he has picked in his interface
	 */
	attending: {
		type: String,
		default: ''
	},
	/**
	 * this contains the socket id of doctor while chatting
	 * it is used by IO to emit events.
	 */
	chat_id: {
		type: String,
		default: ''
	},
	/**
	 * doctor registered at
	 */
	created_at: Number,
	name: String,
	department: String,
	email: String,
	telephone: Number,
	post: String,
	upi_id: String,
	fees: Number,
    /**
     * Branches created by this doctor
     */
    branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }],
	status:{type:String, default: "Online"},
	degree:String,
	regNO:String,
	signature:String,
}, { timestamps: true });

// create the model
const Doctor = mongoose.model('Doctor', DoctorSchema, 'doctors');

// export the model
module.exports = Doctor;
