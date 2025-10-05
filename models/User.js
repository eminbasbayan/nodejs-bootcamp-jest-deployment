const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    min: [0, 'Yaş 0\'dan küçük olamaz']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
