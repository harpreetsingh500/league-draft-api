const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  seasonId: {
    type: String,
    required: true
  },
  teamId: {
    type: String
  },
  primaryRole: {
    type: String,
    required: true
  },
  secondaryRole: {
    type: String
  },
  notes: {
    type: String
  },
  soloRank: {
    type: String
  },
  flexRank: {
    type: String
  },
  riotAccountId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('Player', PlayerSchema);
