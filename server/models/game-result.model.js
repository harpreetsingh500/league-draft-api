const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
    tournamentCode: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    result: {
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

module.exports = mongoose.model('GameResult', GameResultSchema);
