const express = require("express");
const aiRouter = express.Router();
const { summarizeChat } = require("../controller/aiController");

aiRouter.post("/summarize-chat", summarizeChat);

module.exports = aiRouter;
