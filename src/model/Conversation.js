// models/Conversation.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User" }, // gồm 2 người (hoặc nhóm sau này)
    ],
    lastMessage: { type: String }, // để hiển thị nhanh trong danh sách
  },
  { timestamps: true, versionKey: false, collection: "conversations" }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
