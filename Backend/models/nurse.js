const mongoose = require('mongoose');

const NurseSchema = new mongoose.Schema({
    username: { type: String, },
    password: { type: String, },
    village: { type: String, },
});


module.exports = mongoose.model('Nurse', NurseSchema);