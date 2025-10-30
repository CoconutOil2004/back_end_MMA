const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const router = require("./src/routes/index.js");
require("dotenv").config();

const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🧭 Routes
app.use("/", router);

// 🗄️ Kết nối MongoDB (chỉ gọi 1 lần khi khởi động server)
connectDB();

// 🚫 KHÔNG dùng app.listen() khi deploy lên Vercel
// const port = process.env.PORT || 9999;
// app.listen(port, () => console.log(`Running on ${port}`));

// ✅ Thay bằng export để Vercel tự khởi chạy
module.exports = app;
