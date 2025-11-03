const Conversation = require("../model/Conversation");
const Message = require("../model/Message");

/**
 * 📩 Tạo hoặc lấy lại một cuộc hội thoại giữa 2 user
 * Nếu 2 người đã có conversation rồi thì trả về luôn, không tạo mới.
 */
exports.createOrGetConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Thiếu senderId hoặc receiverId" });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Không thể tạo hội thoại với chính mình." });
    }

    // 🔍 Tìm hội thoại có sẵn
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("participants", "name email avatar");

    // ➕ Nếu chưa có, tạo mới
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      conversation = await conversation.populate(
        "participants",
        "name email avatar"
      );
      console.log(`💬 Tạo hội thoại mới giữa ${senderId} và ${receiverId}`);
    } else {
      console.log(`✅ Hội thoại đã tồn tại giữa ${senderId} và ${receiverId}`);
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("❌ Lỗi khi tạo/lấy hội thoại:", error);
    res.status(500).json({
      message: "Lỗi khi tạo hoặc lấy hội thoại",
      error: error.message,
    });
  }
};

/**
 * 📨 Lấy danh sách hội thoại của 1 user
 * Trả về kèm thông tin người tham gia, sắp xếp mới nhất lên đầu
 */
exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hội thoại",
      error: error.message,
    });
  }
};

/**
 * 🗑️ Xóa một cuộc hội thoại (và các tin nhắn trong đó)
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Đã xóa hội thoại thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa hội thoại",
      error: error.message,
    });
  }
};
