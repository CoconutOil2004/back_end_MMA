const express = require("express");
const {
  createReport,
  getAllReports,
  approveReport,
  rejectReport,
} = require("../controller/reportController");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

const reportRouter = express.Router();
reportRouter.post("/create", protect, createReport);
reportRouter.get("/all", protect, verifyAdmin, getAllReports);
reportRouter.patch("/accept/:id", protect, verifyAdmin, approveReport);
reportRouter.patch("/reject/:id", protect, verifyAdmin, rejectReport);
module.exports = reportRouter;
