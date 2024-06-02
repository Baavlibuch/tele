const mongoose = require('mongoose');

const { Schema } = mongoose;
// seems like never used

// create a schema
const AssessmentSchema = new Schema({
    fever: String,
    cough: String,
    shortness_of_breath: String,
    fatigue: String,
    headache: String,
    sore_throat: String,
    international_traveller: String,
    patient_in_household: String,
    contact_with_patient: String,
    symptomatic: Boolean,
    suspect: Boolean,
    additional: String,
    name: String,
    telephone: String,
    age: String,
    latitude: Number,
    longitude: Number,
    ip: {
        type: String,
        unique: true
    }
});

// create the model
const Assessment = mongoose.model('Assessment', AssessmentSchema, 'assessment');

// export the model
module.exports = Assessment;