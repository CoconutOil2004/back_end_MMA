const express = require("express");
const app = express();
const port = process.env.PORT || 9999;
const connectDB = require("./config/db.js");
const cors = require("cors");
const router = require("./src/routes/index.js");
app.use(cors());
app.use(express.json());
app.use("/", router);
connectDB();
app.listen(port, () => {
  console.log(`Running on ${port}`);
});
