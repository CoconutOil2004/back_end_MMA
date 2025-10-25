//const Post = require("../model/Post");
const User = require("../model/User");
const Post = require("../model/Post");

// ---------- TẠO BÀI ĐĂNG ----------
exports.createPost = async (req, res) => {
  try {
    const { type, title, description, imageUrl, location, contactPhone } =
      req.body;

    if (!type || !title || !description || !imageUrl) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Tạo bài đăng mới
    const newPost = await Post.create({
      userId: req.user.id,
      type,
      title,
      description,
      imageUrl,
      location,
      contactPhone,
    });

    // Populate để lấy thông tin người đăng (chỉ các trường cần thiết)
    const populatedPost = await newPost.populate("userId", "name email avatar");

    res.status(201).json({
      message: "Đăng bài thành công!",
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
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo bài đăng", error });
  }
};

// ---------- LẤY DANH SÁCH BÀI ĐĂNG ----------
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email avatar phone")
      .sort({ createdAt: -1 }); // mới nhất trước

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

// ---------- TÌM KIẾM BÀI ĐĂNG ----------
exports.searchPosts = async (req, res) => {
  try {
    const { q, type, location } = req.query;
    
    let query = {};
    
    // Tìm kiếm theo từ khóa
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Lọc theo loại bài đăng
    if (type) {
      query.type = type;
    }
    
    // Lọc theo vị trí
    if (location) {
      query['location.placeName'] = { $regex: location, $options: 'i' };
    }
    
    const posts = await Post.find(query)
      .populate("userId", "name email avatar phone")
      .sort({ createdAt: -1 })
      .limit(50); // Giới hạn 50 kết quả

    res.status(200).json({
      message: "Tìm kiếm thành công",
      results: posts,
      count: posts.length
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tìm kiếm", error });
  }
};
