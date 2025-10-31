const Notification = require("../model/Notification");
const User = require("../model/User");
// 📨 1. Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { receiverId, senderId, type, relatedPostId, relatedReportId } =
      req.body;

    if (!receiverId || !senderId || !type) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    const sender = await User.findById(senderId).select("name");

    let title = "";
    let message = "";

    switch (type) {
      case "like":
        title = "Bài viết của bạn được thích!";
        message = `${sender.name} đã thích bài đăng của bạn.`;
        break;

      case "match_found":
        title = "Đã tìm thấy bài đăng trùng khớp!";
        message = `Hệ thống đã tìm thấy một bài đăng trùng với bài bạn đăng.`;
        break;

      case "report_update":
        title = "Báo cáo của bạn đã được cập nhật";
        message = `Trạng thái báo cáo của bạn đã thay đổi.`;
        break;

      case "system":
      default:
        title = "Thông báo hệ thống";
        message = "Có một thông báo mới từ hệ thống.";
        break;
    }

    const newNotification = await Notification.create({
      receiverId,
      senderId,
      type,
      title,
      message,
      relatedPostId,
      relatedReportId,
    });

    const populated = await newNotification.populate(
      "senderId",
      "name email avatar"
    );

    res.status(201).json({
      message: "Tạo thông báo thành công!",
      notification: populated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo thông báo", error: error.message });
  }
};
// 📬 2. Lấy tất cả thông báo của user (hoặc admin)
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ receiverId: userId })
      .populate("receiverId", "name")
      .populate("senderId", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông báo", error: error.message });
  }
};
// ✅ 3. Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }

    res
      .status(200)
      .json({ message: "Đã đánh dấu là đã đọc.", notification: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
  }
};
// 🗑 4. Xoá thông báo (user hoặc admin)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }

    res.status(200).json({ message: "Đã xoá thông báo." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xoá thông báo", error: error.message });
  }
};
