const express = require("express");
const router = express.Router();
const { 
  getBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getBlogById,
  submitComment,
  getApprovedComments,
  getAllComments,
  approveComment,
  rejectComment,
  getPendingCommentsCount,
  disapproveComment,
  deleteComment
} = require('../../Controller/AdminController/BlogController');

const { medicalUpload } = require('../../middleware/upload');
const { authMiddleware, authorizeRole, checkPermission } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");
const upload = medicalUpload;

// ========== PUBLIC ROUTES (No auth, no tracking) ==========
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/:id/comments", submitComment); 
router.get("/:id/comments/approved", getApprovedComments); 

// ========== PROTECTED ROUTES WITH TRACKING ==========
router.use(authMiddleware, activityTracker);

router.post("/", upload.single("image"), createBlog);     
router.put("/:id", upload.single("image"), updateBlog);   
router.delete("/:id", deleteBlog);                        

router.get("/:id/comments/all", getAllComments);          
router.put("/comments/:commentId/approve", approveComment);  
router.delete("/comments/:commentId/reject", rejectComment); 
router.get("/comments/pending/count", getPendingCommentsCount); 
router.put("/comments/:commentId/disapprove", disapproveComment); 
router.delete("/comments/:commentId", deleteComment);      

module.exports = router;