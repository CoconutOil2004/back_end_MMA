// routes/userRoutes.js
const express = require("express");
const userRoute = express.Router();

const { protect } = require("../src/middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../src/controller/userController");

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/profile", protect, getProfile);

module.exports = userRoute;
