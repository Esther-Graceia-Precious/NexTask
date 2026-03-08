const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getAllUsers,
  updateUserRole,
  getAllTasks,
  getAllEvents,
  getStats,
  deleteTask
} = require("../controllers/adminController");

// all routes require auth + ADMIN role
router.get("/admin/stats", auth, role("ADMIN"), getStats);
router.get("/admin/users", auth, role("ADMIN"), getAllUsers);
router.put("/admin/users/:id/role", auth, role("ADMIN"), updateUserRole);
router.get("/admin/tasks", auth, role("ADMIN"), getAllTasks);
router.delete("/admin/tasks/:id", auth, role("ADMIN"), deleteTask);
router.get("/admin/events", auth, role("ADMIN"), getAllEvents);

module.exports = router;