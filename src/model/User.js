// models/User.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._%+-]+@fpt\.edu\.vn$/,
    },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    phone: { type: String }, // người khác có thể liên hệ trực tiếp
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

module.exports = mongoose.model("User", UserSchema);
