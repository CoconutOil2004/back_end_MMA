const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body; // [{senderName, text}]

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "Không có tin nhắn để tóm tắt." });
    }

    // Nối các tin nhắn thành đoạn hội thoại
    const chatText = messages.map(m => `${m.senderName}: ${m.text}`).join("\n");

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
