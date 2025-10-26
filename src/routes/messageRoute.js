const express = require("express");
const {
  sendMessage,
  getMessages,
  markAsRead,
} = require("../controller/messageController");
const messageRouter = express.Router();

messageRouter.post("/", sendMessage);
messageRouter.get("/:conversationId", getMessages);
messageRouter.put("/read", markAsRead);
module.exports = messageRouter;
