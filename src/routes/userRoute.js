// routes/userRoutes.js
const express = require("express");
const userRoute = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getProfile,
  updateAvatar,
  forgotPassword,
} = require("../controller/userController");

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/profile", protect, getProfile);
userRoute.patch("/update-avatar", protect, updateAvatar);
userRoute.post("/forgot-password", forgotPassword);

module.exports = userRoute;