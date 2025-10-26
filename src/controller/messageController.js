const Message = require("../model/Message");
const Conversation = require("../model/Conversation");

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    const message = await Message.create({
      conversationId,
      senderId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi gửi tin nhắn",
      error: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate("senderId", "name avatar email") // 👈 thêm dòng này
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy tin nhắn", error });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Đã đánh dấu tin nhắn là đã đọc" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đọc",
      error: error.message,
    });
  }
};
