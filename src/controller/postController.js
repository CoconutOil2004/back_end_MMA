//const Post = require("../model/Post");
const User = require("../model/User");
const Post = require("../model/Post");
const Notification = require("../model/Notification")
const { findPotentialMatches } = require("./aiController");
// ---------- TẠO BÀI ĐĂNG ----------
exports.createPost = async (req, res) => {
  try {
    const { type, title, description, imageUrl, location, contactPhone } =
      req.body;

    // 🧩 1. Kiểm tra dữ liệu bắt buộc
    if (!type || !title || !description || !imageUrl) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // 🧩 2. Tạo bài đăng mới
    const newPost = await Post.create({
      userId: req.user.id,
      type,
      title,
      description,
      imageUrl,
      location,
      contactPhone,
    });

    // 🧩 3. Populate thông tin user đăng bài
    const populatedPost = await newPost.populate("userId", "name email avatar");

    // 🧩 4. Gọi AI để quét bài trùng khớp
    const matchedPost = await findPotentialMatches(newPost);

    // 🧩 5. Nếu tìm thấy bài trùng khớp
    if (matchedPost) {
      // cập nhật trạng thái hai bài
      await Post.findByIdAndUpdate(newPost._id, {
        status: "matched",
        matchedPostId: matchedPost._id,
      });
      await Post.findByIdAndUpdate(matchedPost._id, {
        status: "matched",
        matchedPostId: newPost._id,
      });

      // Gửi thông báo cho chủ bài đăng kia
      await Notification.create({
        receiverId: matchedPost.userId,
        senderId: req.user.id,
        type: "match_found",
        relatedPostId: matchedPost._id,
        title: "Đã tìm thấy bài đăng trùng khớp!",
        message: `Hệ thống phát hiện bài đăng "${matchedPost.title}" trùng với bài bạn vừa đăng.`,
      });
    }

    // 🧩 6. Trả về phản hồi cho client
    return res.status(201).json({
      message: matchedPost
        ? "Đăng bài thành công và đã tìm thấy bài trùng khớp!"
        : "Đăng bài thành công!",
      post: {
        id: populatedPost._id,
        title: populatedPost.title,
        description: populatedPost.description,
        imageUrl: populatedPost.imageUrl,
        type: populatedPost.type,
        contactPhone: populatedPost.contactPhone,
        createdAt: populatedPost.createdAt,
        user: {
          name: populatedPost.userId.name,
          email: populatedPost.userId.email,
          avatar: populatedPost.userId.avatar,
        },
      },
      // 👇 chỉ gửi nếu có match
      matchedPost: matchedPost
        ? {
            id: matchedPost._id,
            title: matchedPost.title,
            description: matchedPost.description,
            imageUrl: matchedPost.imageUrl,
            type: matchedPost.type,
            contactPhone: matchedPost.contactPhone,
            createdAt: matchedPost.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo bài đăng:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo bài đăng", error: error.message });
  }
};
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email avatar phone")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài đăng", error });
  }
};
// ---------- LẤY CHI TIẾT 1 BÀI ĐĂNG ----------
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "name email avatar phone"
    );
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy bài đăng", error });
  }
};

// ---------- CẬP NHẬT BÀI ĐĂNG ----------
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    // Kiểm tra quyền (chỉ chủ bài hoặc admin được sửa)
    if (post.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa bài này" });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Cập nhật bài đăng thành công!",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bài đăng", error });
  }
};

// ---------- XÓA BÀI ĐĂNG ----------
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    // Kiểm tra quyền
    if (post.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bài này" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Xóa bài đăng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài đăng", error });
  }
};
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params; // id bài post
    const userId = req.user.id; // id người dùng (lấy từ middleware JWT)

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng." });
    }

    // Kiểm tra user đã like chưa
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Nếu đã like -> unlike
      post.likes.pull(userId);
    } else {
      // Nếu chưa like -> like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Đã bỏ thích bài đăng." : "Đã thích bài đăng.",
      likeCount: post.likes.length,
      liked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi like bài đăng", error });
  }
};
// ---------- LẤY DANH SÁCH BÀI ĐĂNG CỦA 1 USER ----------
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const posts = await Post.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email avatar phone");

    return res.status(200).json({
      success: true,
      message:
        posts.length > 0
          ? "Lấy danh sách bài đăng thành công"
          : "Bạn chưa có bài đăng nào",
      data: posts,
      total: posts.length,
    });
  } catch (error) {
    console.error("Error in getMyPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy bài đăng",
      error: error.message,
    });
  }
};
