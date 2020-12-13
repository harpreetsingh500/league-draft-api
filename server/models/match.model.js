const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  seasonId: {
    type: String,
    required: true
  },
  teamOneId: {
    type: String,
    required: true
  },
  teamTwoId: {
    type: String,
    required: true
  },
  teamOneProtectedBan: {
    type: String,
    required: true
  },
  teamTwoProtectedBan: {
    type: String,
    required: true
  },
  matchDate: {
    type: String,
    required: true
  },
  matchTime: {
    type: String,
    required: true
  },
  timeZone: {
    type: String,
    required: true
  },
  matchLink: {
    type: String
  },
  winningTeamId: {
    type: String,
  },
  vodLink: {
    type: String
  },
  wasShoutCasted: {
    type: Boolean
  },
  tournamentCode: {
    type: String
  },
  gameId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Match', MatchSchema);
