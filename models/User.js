const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
 },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
 },
  password: { 
    type: String, 
    required: true,
    minlength: 6,
 },
  tokenBlacklist: {
    type: [String],
    default: []
  },
  resetPasswordToken: String,

  resetPasswordExpire: Date,

  lastLoginAt: Date,

  lastLogoutAt: Date
},
{ timestamps: true });


module.exports = mongoose.model('User', userSchema);
