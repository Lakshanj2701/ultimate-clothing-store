const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;