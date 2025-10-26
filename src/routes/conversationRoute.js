const express = require("express");
const {
  createOrGetConversation,
  getConversations,
  deleteConversation,
} = require("../controller/conversationController");
const conversationRouter = express.Router();

conversationRouter.post("/", createOrGetConversation);
conversationRouter.get("/:userId", getConversations);
conversationRouter.delete("/:conversationId", deleteConversation);
module.exports = conversationRouter;
