const express = require("express");
const {
  createNotification,
  getNotificationsByUser,
  markAsRead,
} = require("../controller/notiticationController");
const { protect } = require("../middleware/authMiddleware");
const notificationRouter = express.Router();

notificationRouter.post("/create", createNotification);
notificationRouter.get("/:userId", protect, getNotificationsByUser);
notificationRouter.post("/marked/:id", protect, markAsRead);
module.exports = notificationRouter;
