const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  action: { 
    type: String, 
    enum: ["CREATE", "UPDATE", "DELETE", "CONFLICT", "COMMENT"] 
  },

  performedBy: {
    type: String,
    default: 'Unknown'
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);