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

// 🗄️ Kết nối MongoDB
connectDB();

// 🚀 Chạy server local
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
