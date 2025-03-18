const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Explicitly specify 'detail' as the collection name (third parameter)
module.exports = mongoose.model('detail', FileSchema, 'detail');
