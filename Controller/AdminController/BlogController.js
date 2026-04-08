const Blog = require("../../Schema/AdminSchema/BlogSchema");
const Comment = require("../../Schema/AdminSchema/BlogComment"); 
const mongoose = require("mongoose");

const createBlog = async (req, res) => {
  try {
    const {
      metaTitle,
      metaDescription,
      metaURL,
      title,
      category,
      content,
      status,
    } = req.body;

    const image = req.file ? req.file.path : "";
    const blog = await Blog.create({
      metaTitle,
      metaDescription,
      metaURL,
      title,
      category,
      content,
      status,
      image,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Blog save failed" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = req.file.path; 
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

const getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
};

const deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ blogId: req.params.id });
  res.json({ message: "Blog deleted" });
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== COMMENT FUNCTIONS ===============
const submitComment = async (req, res) => {
  try {
    const blogId = req.params.id; 
    const { name, email, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ✅ IMPORTANT: Store as ObjectId
    const newComment = await Comment.create({
      blogId: new mongoose.Types.ObjectId(blogId), // Store as ObjectId
      name,
      email,
      comment,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Comment submitted successfully! It will be visible after admin approval.",
      comment: newComment,
    });
  } catch (error) {
    console.error("❌ Submit Comment Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit comment",
      error: error.message 
    });
  }
};

const approveComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    res.json({
      success: true,
      message: "Comment approved successfully",
      comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to approve comment" 
    });
  }
};

const rejectComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    res.json({
      success: true,
      message: "Comment rejected and deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to reject comment" 
    });
  }
};

const getApprovedComments = async (req, res) => {
  try {
    const blogId = req.params.id; // ✅ Using :id from route
    
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid blog ID" 
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    // Search for approved comments (both string and ObjectId formats)
    const comments = await Comment.find({
      $or: [
        { blogId: blogId }, // String format
        { blogId: new mongoose.Types.ObjectId(blogId) } // ObjectId format
      ],
      isApproved: true
    }).sort({ createdAt: -1 });

    // console.log("✅ Found", comments.length, "approved comments");

    res.json({
      success: true,
      blogId: blogId,
      blogTitle: blog.title,
      count: comments.length,
      comments: comments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch approved comments",
      error: error.message 
    });
  }
};

const getAllComments = async (req, res) => {
  try {
    const blogId = req.params.id; 
    
    if (!blogId) {
      return res.status(400).json({ 
        success: false,
        message: "Blog ID is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Blog ID format" 
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    const comments = await Comment.find({
      $or: [
        { blogId: blogId }, // String format
        { blogId: new mongoose.Types.ObjectId(blogId) } // ObjectId format
      ]
    })
    .sort({ createdAt: -1 })
    .populate("blogId", "title");

    // console.log("✅ Found", comments.length, "total comments");

    res.json({
      success: true,
      blogId: blogId,
      blogTitle: blog.title,
      count: comments.length,
      comments: comments
    });
    
  } catch (error) {
    console.error("❌ GetAllComments Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch comments",
      error: error.message 
    });
  }
};

const getPendingCommentsCount = async (req, res) => {
  try {
    const count = await Comment.countDocuments({ isApproved: false });
    res.json({ 
      success: true,
      pendingCount: count 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get pending count" 
    });
  }
};

const disapproveComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved: false },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    res.json({
      success: true,
      message: "Comment disapproved successfully",
      comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to disapprove comment" 
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    res.json({
      success: true,
      message: "Comment deleted permanently",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete comment" 
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  getBlogById,
  submitComment,
  approveComment,
  rejectComment,
  getApprovedComments,
  getAllComments,
  deleteComment,
  disapproveComment,
  getPendingCommentsCount,
};