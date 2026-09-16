const express = require("express");

const router = express.Router();

const {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// CREATE NOTIFICATION
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  createNotification
);

// GET MY NOTIFICATIONS
router.get(
  "/my",
  protect,
  getMyNotifications
);

// MARK NOTIFICATION AS READ
router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// DELETE NOTIFICATION
router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;