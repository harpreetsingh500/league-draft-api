const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  captain: {
    type: String,
    required: true
  },
  seasonId: {
    type: String,
    required: true
  },
  players: {
    type: Array
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Team', TeamSchema);
