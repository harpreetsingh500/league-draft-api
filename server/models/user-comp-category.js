const mongoose = require('mongoose');

const UserCompCateogry = new mongoose.Schema({
  userId: {
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


module.exports = mongoose.model('UserCompCategory', UserCompCateogry);
