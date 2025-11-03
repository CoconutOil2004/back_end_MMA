const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const Post = require("../model/Post");
exports.summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body; // [{senderName, text}]

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "Không có tin nhắn để tóm tắt." });
    }

    // Nối các tin nhắn thành đoạn hội thoại
    const chatText = messages
      .map((m) => `${m.senderName}: ${m.text}`)
      .join("\n");

    // Prompt gửi lên Gemini
    const prompt = `
    Hãy tóm tắt ngắn gọn đoạn hội thoại sau bằng tiếng Việt, 
    nêu chủ đề chính và nội dung chính của các bên:
    ${chatText}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    const summary = result.response.text();
    res.json({ summary });
  } catch (err) {
    console.error("AI summarize error:", err);
    res.status(500).json({ message: "Lỗi khi tóm tắt AI", error: err.message });
  }
};
exports.findPotentialMatches = async (newPost) => {
  try {
    const oppositeType = newPost.type === "lost" ? "found" : "lost";

    // Tìm các bài khác loại đang mở
    const candidates = await Post.find({
      type: oppositeType,
      status: "open",
    }).lean();
    if (!candidates.length) {
      console.log("⚠️ Không có bài nào để match.");
      return null;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let bestMatch = null;
    let bestScore = 0;

    for (const post of candidates) {
      const prompt = `
  Ngữ cảnh: đây là các bài đăng trên ứng dụng "Lost & Found" của sinh viên. 
  Người dùng có thể đăng bài "mất đồ" hoặc "nhặt được đồ".
  Nhiệm vụ của bạn là đánh giá xem hai bài đăng này có khả năng nói về CÙNG MỘT VẬT hay không.
  Mỗi bài có tiêu đề và mô tả. Hãy trả về **một số duy nhất từ 0 đến 1**, 
  trong đó 1 nghĩa là chắc chắn là cùng một vật, 0 nghĩa là hoàn toàn khác.
  
  Chỉ trả về một số duy nhất, không cần giải thích.
  
  Bài 1:
  Tiêu đề: ${newPost.title}
  Mô tả: ${newPost.description}

  Bài 2:
  Tiêu đề: ${post.title}
  Mô tả: ${post.description}
`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const score = parseFloat(text.match(/0\.\d+|1\.0/)?.[0] || "0");

        console.log(
          `🔍 So sánh "${newPost.title}" ↔ "${post.title}" → điểm:`,
          score
        );

        if (score > bestScore) {
          bestScore = score;
          bestMatch = post;
        }
      } catch (err) {
        console.error("⚠️ Lỗi khi so sánh bài:", err.message);
      }
    }

    if (bestScore >= 0.5) {
      console.log(`🎯 Đã tìm thấy bài match (${bestScore}):`, bestMatch.title);
      return bestMatch;
    } else {
      console.log("❌ Không có bài nào đạt ngưỡng match.");
      return null;
    }
  } catch (error) {
    console.error("❌ Lỗi trong findPotentialMatches:", error);
    return null;
  }
};
