const mongoose = require('mongoose');

const hitCounterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HitCounter', hitCounterSchema);
