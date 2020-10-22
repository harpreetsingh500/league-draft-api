const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('Season', SeasonSchema);
