const Report = require("../model/Report");
const Notification = require("../model/Notification");
const User = require("../model/User");
const Post = require("../model/Post");
exports.createReport = async (req, res) => {
  try {
    const { reporterId, postId, reason } = req.body;

    if (!reporterId || !postId || !reason) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    const newReport = await Report.create({
      reporterId,
      postId,
      reason,
    });
    res.status(201).json({
      message: "Gửi báo cáo thành công!",
      report: newReport,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi gửi báo cáo", error: error.message });
  }
};
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "name email avatar")
      .populate("postId", "title imageUrl status")
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách báo cáo", error: error.message });
  }
};
exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const report = await Report.findById(id)
      .populate("reporterId", "name email avatar")
      .populate("postId", "userId title type imageUrl");
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    }
    const post = await Post.findById(report.postId?._id);
    if (!post) {
      report.status = "resolved";
      report.adminNote = "Bài đăng không còn tồn tại.";
      await report.save();

      return res.status(200).json({
        message: "Báo cáo đã được duyệt (bài đăng không tồn tại).",
        report,
      });
    }
    await Post.findByIdAndDelete(post._id);
    report.status = "resolved";
    report.adminNote =
      adminNote || "Đã xác minh vi phạm, bài đăng bị xóa khỏi hệ thống.";
    await report.save();
    await Notification.create({
      receiverId: report.reporterId._id,
      type: "report_update",
      title: "Báo cáo của bạn đã được duyệt",
      message: `Admin đã xác minh và xóa bài đăng vi phạm: "${post.title}".`,
      relatedReportId: report._id,
    });
    await Notification.create({
      receiverId: post.userId,
      type: "system",
      title: "Bài đăng của bạn đã bị xóa",
      message: `Bài đăng "${post.title}" của bạn đã bị xóa do vi phạm quy định.`,
      relatedPostId: post._id,
    });

    res.status(200).json({
      message: "Duyệt và xóa bài vi phạm thành công!",
      deletedPostId: post._id,
      report,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi duyệt báo cáo", error: error.message });
  }
};

// 🧩 4. Admin từ chối báo cáo
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const report = await Report.findById(id);
    if (!report)
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });

    report.status = "reviewed";
    report.adminNote = adminNote || "Báo cáo đã bị từ chối.";
    await report.save();

    await Notification.create({
      receiverId: report.reporterId,
      type: "report_update",
      title: "Báo cáo của bạn đã bị từ chối",
      message: "Admin đã xem xét và từ chối báo cáo của bạn.",
      relatedReportId: report._id,
    });

    res.status(200).json({ message: "Đã từ chối báo cáo thành công!", report });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi từ chối báo cáo", error: error.message });
  }
};
