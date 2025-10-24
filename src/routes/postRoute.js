const express = require("express");
const postRouter = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} = require("../controller/postController");
// Routes
postRouter.post("/", protect, createPost);
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);
postRouter.put("/:id", protect, updatePost);
postRouter.delete("/:id", protect, deletePost);
postRouter.post("/:id/like", protect, likePost);
module.exports = postRouter;
