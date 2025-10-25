// routes/userRoutes.js
const express = require("express");
const userRoute = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
} = require("../controller/userController");

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/profile", protect, getProfile);
userRoute.post("/forgot-password", forgotPassword);
module.exports = userRoute;
