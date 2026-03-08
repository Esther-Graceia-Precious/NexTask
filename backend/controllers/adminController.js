const User = require("../models/Users");
const Task = require("../models/Task");
const Event = require("../models/Event");
const mongoose = require("mongoose");

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["ADMIN", "MANAGER", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// get all tasks (admin sees everything)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// get stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Done" });
    const overdueTasks = await Task.countDocuments({ isOverdue: true, status: { $ne: "Done" } });
    const todoTasks = await Task.countDocuments({ status: "Todo" });
    const inProgressTasks = await Task.countDocuments({ status: "In Progress" });

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      overdueTasks,
      todoTasks,
      inProgressTasks
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// delete any task (admin power)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};