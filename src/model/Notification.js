const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    // Ai là người nhận thông báo
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Ai là người gây ra hành động (like, comment, report, v.v.)
    senderId: { type: Schema.Types.ObjectId, ref: "User" },

    // Liên kết đến bài đăng hoặc report nếu có
    relatedPostId: { type: Schema.Types.ObjectId, ref: "Post" },
    relatedReportId: { type: Schema.Types.ObjectId, ref: "Report" },

    // Nội dung chính
    type: {
      type: String,
      enum: [
        "like", // ai đó like bài
        "match_found", // AI/Người match bài
        "report_update", // báo cáo đã được duyệt
        "system", // thông báo hệ thống
      ],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false, collection: "notifications" }
);

module.exports = mongoose.model("Notification", NotificationSchema);
