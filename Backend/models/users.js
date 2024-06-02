const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const DoctorSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String
});

const HitSchema = new Schema({
    hits: Number
});

// create the model
const Doctor = mongoose.model('Doctor', DoctorSchema, 'doctors');
const Hits = mongoose.model('Hits', HitSchema, 'hits');

// export the model
module.exports.Doctor = Doctor;
module.exports.Hits = Hits;