const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
    name: {
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
