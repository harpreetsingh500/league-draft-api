const mongoose = require('mongoose');

const TournamentCodeSchema = new mongoose.Schema({
    seasonId: {
        type: String,
        required: true
    },
    tournamentCode: {
        type: String,
        required: true
    },
    matchId: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    versionKey: false
});

module.exports = mongoose.model('TournamentCode', TournamentCodeSchema);
