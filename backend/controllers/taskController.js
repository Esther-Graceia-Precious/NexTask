const Task = require("../models/Task");
const Event = require("../models/Event");
const User = require("../models/Users");
const mongoose = require("mongoose");
const Notification = require("../models/Notifications");

const saveNotification = async (userId, message, type, taskId) => {
  try {
    await Notification.create({ userId, message, type, taskId });
  } catch (err) {
    console.error("Notification save error:", err);
  }
};

// ====== GET TASKS ======
exports.getTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const tasks = await Task.find({
      $or: [{ assignedTo: userId }, { createdBy: userId }]
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");
    res.json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== CREATE TASK ======
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedToName, priority, deadline } = req.body;
    const creator = await User.findById(req.user.userId);
    const creatorName = creator?.name || "Someone";

    if (!title || !assignedToName) {
      return res.status(400).json({ message: "Title and assignee name are required" });
    }

    const assignee = await User.findOne({ name: assignedToName });
    if (!assignee) {
      return res.status(404).json({ message: `User "${assignedToName}" not found` });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignee._id,
      createdBy: req.user.userId,
      priority: priority || "Medium",
      deadline: deadline || null,
      status: "Todo",
      version: 0
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    await Event.create({
      taskId: task._id,
      action: "CREATE",
      userId: req.user.userId,
      performedBy: req.user.userId,
      details: `${creatorName} created task: "${title}" and assigned to ${assignedToName}`
    });

    // emit to assignee
    const users = req.app.get("users");
    const io = req.app.get("io");

    const assigneeSocketId = users[assignee._id.toString().trim()];
    if (assigneeSocketId) {
      io.to(assigneeSocketId).emit("taskCreated", { task: populated });
    }

    // emit to creator if different from assignee
    const creatorSocketId = users[req.user.userId.toString().trim()];
    if (creatorSocketId && req.user.userId.toString() !== assignee._id.toString()) {
      io.to(creatorSocketId).emit("taskCreated", { task: populated });
    }

    // save notifications to DB
    await saveNotification(assignee._id, `New task assigned to you: "${title}"`, "taskCreated", task._id);
    if (req.user.userId.toString() !== assignee._id.toString()) {
      await saveNotification(req.user.userId, `You created task: "${title}"`, "taskCreated", task._id);
    }
    res.status(201).json(populated);
  } 
  
  catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== UPDATE TASK ======
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, version, priority, deadline } = req.body;
    const task = await Task.findById(req.params.id);
    const updater = await User.findById(req.user.userId);
    const updaterName = updater?.name || "Someone";

    if (!task) return res.status(404).json({ message: "Task not found" });

    // only creator or assignee can update
    const isCreator = task.createdBy.toString() === req.user.userId;
    const isAssignee = task.assignedTo.toString() === req.user.userId;

    
    if (!isCreator && !isAssignee) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // version conflict check
    if (task.version !== version) {
      return res.status(409).json({ message: "Conflict! Task was modified by someone else." });
    }

    // assignee can only update status
    task.status = status;
    task.version += 1;

    // only creator can update these fields
    if (isCreator) {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (deadline !== undefined) {
        task.deadline = deadline || null;
        if (deadline && new Date(deadline) > new Date()) {
          task.isOverdue = false;
        }
      }
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    await Event.create({
      taskId: task._id,
      action: "UPDATE",
      userId: req.user.userId,
      performedBy: req.user.userId,
      details: `${updaterName} updated "${task.title}" → status: ${status}`
    });

    // emit to both assignee and creator
    const users = req.app.get("users");
    const io = req.app.get("io");

    const assigneeSocketId = users[task.assignedTo.toString().trim()];
    if (assigneeSocketId) {
      io.to(assigneeSocketId).emit("taskUpdated", { task: populated });
    }

    const creatorSocketId = users[task.createdBy.toString().trim()];
    if (creatorSocketId && task.createdBy.toString() !== task.assignedTo.toString()) {
      io.to(creatorSocketId).emit("taskUpdated", { task: populated });
    }

    await saveNotification(task.assignedTo, `Task updated: "${task.title}"`, "taskUpdated", task._id);
    if (task.createdBy.toString() !== task.assignedTo.toString()) {
      await saveNotification(task.createdBy, `Task updated: "${task.title}"`, "taskUpdated", task._id);
    }

    res.json(populated);
  } 
  
  catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== DELETE TASK ======
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const deleter = await User.findById(req.user.userId);
    const deleterName = deleter?.name || "Someone";
    if (!task) return res.status(404).json({ message: "Task not found" });

    // only creator can delete
    if (task.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the creator can delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);

    await Event.create({
      taskId: task._id,
      action: "DELETE",
      userId: req.user.userId,
      performedBy: req.user.userId,
      details: `${deleterName} deleted task: "${task.title}"`
    });

    // emit to assignee and creator
    const users = req.app.get("users");
    const io = req.app.get("io");

    const assigneeSocketId = users[task.assignedTo.toString().trim()];
    if (assigneeSocketId) {
      io.to(assigneeSocketId).emit("taskDeleted", { taskId: req.params.id });
    }

    const creatorSocketId = users[task.createdBy.toString().trim()];
    if (creatorSocketId && task.createdBy.toString() !== task.assignedTo.toString()) {
      io.to(creatorSocketId).emit("taskDeleted", { taskId: req.params.id });
    }

    await saveNotification(task.assignedTo, `🗑️ Task deleted: "${task.title}"`, "taskDeleted", task._id);
    if (task.createdBy.toString() !== task.assignedTo.toString()) {
      await saveNotification(task.createdBy, `🗑️ You deleted task: "${task.title}"`, "taskDeleted", task._id);
    }

    res.json({ message: "Task deleted" });
  } 
  
  catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== ADD COMMENT ======
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = await User.findById(req.user.userId);

    const comment = {
      text,
      postedBy: req.user.userId,
      postedByName: user?.name || "Unknown",
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();
    await Event.create({
      taskId: task._id,
      action: "COMMENT",
      userId: req.user.userId,
      performedBy: req.user.userId,
      details: `${user?.name || "Someone"} commented on "${task.title}"`
    });


    // emit to assignee and creator
    const users = req.app.get("users");
    const io = req.app.get("io");

    const assigneeSocketId = users[task.assignedTo.toString().trim()];
    if (assigneeSocketId) {
      io.to(assigneeSocketId).emit("newComment", {
        taskId: task._id,
        comment
      });
    }

    const creatorSocketId = users[task.createdBy.toString().trim()];
    if (creatorSocketId && task.createdBy.toString() !== task.assignedTo.toString()) {
      io.to(creatorSocketId).emit("newComment", {
        taskId: task._id,
        comment
      });
    }

    await saveNotification(task.assignedTo, `New comment on "${task.title}"`, "newComment", task._id);
    if (task.createdBy.toString() !== task.assignedTo.toString()) {
      await saveNotification(task.createdBy, `New comment on "${task.title}"`, "newComment", task._id);
    }

    res.status(201).json(comment);
  } 
  catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== GET EVENTS ======
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(50);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};