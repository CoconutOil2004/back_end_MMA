// models/Report.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    reason: { type: String, required: true }, // lý do cụ thể
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    adminNote: { type: String }, // ghi chú của admin khi xử lý
  },
  { timestamps: true, versionKey: false,collection:"reports" }
);

module.exports = mongoose.model("Report", ReportSchema);
