// controllers/userController.js
const User = require("../model/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------- REGISTER ----------
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Chỉ cho phép email FPT
    if (!/@fpt\.edu\.vn$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Chỉ chấp nhận email FPT.edu.vn" });
    }

    // Kiểm tra email tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Tạo token đăng nhập luôn
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng ký", error });
  }
};

// ---------- LOGIN ----------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra đầu vào
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email chưa được đăng ký." });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác." });
    }

    // Tạo token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng nhập", error });
  }
};

// ---------- GET PROFILE ----------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể lấy thông tin người dùng", error });
  }
};

// ---------- UPDATE AVATAR ----------
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.id;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL is required",
      });
    }

    // Update avatar trong database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ---------- FORGOT PASSWORD ----------
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu mới." });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản này." });
    }

    // Mã hoá mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu", error });
  }
};
// ---------- UPDATE PROFILE ----------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio, education } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, bio, education },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.status(200).json({
      message: "Cập nhật hồ sơ thành công!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật hồ sơ", error });
  }
};

// ---------- CHANGE PASSWORD ----------
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ mật khẩu cũ và mới." });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu", error });
  }
};
