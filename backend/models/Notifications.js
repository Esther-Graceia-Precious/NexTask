const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["taskCreated", "taskUpdated", "taskDeleted", "newComment"], default: "taskUpdated" },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);