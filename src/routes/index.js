const express = require("express");
const userRoute = require("./userRoute");
const postRouter = require("./postRoute");

const router = express.Router();
router.use("/users", userRoute);
router.use("/posts", postRouter);
module.exports = router;
