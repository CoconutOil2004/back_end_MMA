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
  updateProfile,
  changePassword,
} = require("../controller/userController");

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/profile", protect, getProfile);
userRoute.patch("/update-avatar", protect, updateAvatar);
userRoute.post("/forgot-password", protect, forgotPassword);
userRoute.put("/update", protect, updateProfile);
userRoute.put("/change-pass", protect, changePassword);
module.exports = userRoute;
