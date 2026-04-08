const express = require("express");
const {
  getTestimonials,
  createTestimonial,
  toggleTestimonialStatus,
  deleteTestimonial
} = require("../../Controller/AdminController/TestimonialController");
const upload = require("../../middleware/upload");
const { authMiddleware } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");
const router = express.Router();

router.get("/", getTestimonials);
router.use(authMiddleware, activityTracker);
router.post("/", upload.single("video"), createTestimonial);
router.put("/:id/status", toggleTestimonialStatus);
router.delete("/:id", deleteTestimonial);

module.exports = router;
