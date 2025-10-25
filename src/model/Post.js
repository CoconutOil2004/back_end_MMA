// models/Post.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["lost", "found", "picked", "returned"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // --- AI-related ---
    tags: [String],
    aiCategory: { type: String },
    aiConfidence: { type: Number },
    aiVector: { type: [Number] },
    color: { type: String },

    // --- Location ---
    location: {
      lat: Number,
      lng: Number,
      placeName: String,
    },

    // --- Matching state ---
    status: {
      type: String,
      enum: ["open", "matched", "closed"],
      default: "open",
    },
    matchedPostId: { type: Schema.Types.ObjectId, ref: "Post" },

    // --- Contact fallback ---
    contactPhone: { type: String }, // tùy chọn ghi số liên hệ cho bài đăng riêng
  },
  { timestamps: true, versionKey: false, collection: "posts" }
);

module.exports = mongoose.model("Post", PostSchema);
