const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/model/User");

mongoose.connect("mongodb://127.0.0.1:27017/LostFound");

(async () => {
  const hash = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin 2",
    email: "hung@fpt.edu.vn",
    password: hash,
    role: "admin",
    verified: true,
    phone: "0911222333",
  });
  console.log("✅ Admin 2 created!");
  mongoose.connection.close();
})();
