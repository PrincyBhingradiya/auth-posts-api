const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  location: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });


module.exports = mongoose.model('Post', postSchema);
