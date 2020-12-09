const mongoose = require('mongoose');

const TeamComp = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  top: {
    type: String,
    required: true
  },
  jungle: {
    type: String,
    required: true
  },
  mid: {
    type: String,
    required: true
  },
  bot: {
    type: String,
    required: true
  },
  support: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  compCategoryId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('TeamComp', TeamComp);
