const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getNotifications, markAllRead } = require("../controllers/notificationsController");

router.get("/notifications", auth, getNotifications);
router.put("/notifications/read", auth, markAllRead);

module.exports = router;