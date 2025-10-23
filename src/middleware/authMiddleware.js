// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/User.js");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer token"
    if (!token)
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn.", error });
  }
};
