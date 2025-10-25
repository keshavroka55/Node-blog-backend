// src/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',  // refers to Post model
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // refers to User model
    required: false
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);
