const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true
    },
    seasonId: {
        type: String,
        required: true
    },
    data: {
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


module.exports = mongoose.model('Game', GameSchema);
