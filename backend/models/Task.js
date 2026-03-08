const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  deadline: {
    type: Date,
    default: null
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  comments: [
    {
      text: { type: String, required: true },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      postedByName: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);