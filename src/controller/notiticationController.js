const Notification = require("../model/Notification");
// 📨 1. Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const {
      receiverId,
      senderId,
      type,
      title,
      message,
      relatedPostId,
      relatedReportId,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!receiverId || !title || !message) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
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

    // Populate người gửi để frontend có thể hiển thị avatar, name
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
      .populate("senderId", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông báo", error: error.message });
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

    res.status(200).json({ message: "Đã đánh dấu là đã đọc.", notification: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
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
    res.status(500).json({ message: "Lỗi khi xoá thông báo", error: error.message });
  }
};
