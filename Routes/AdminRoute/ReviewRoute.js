const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  changeStatus,
} = require("../../Controller/AdminController/ReviewController");
const activityTracker = require('../../middleware/activityTracker');
const { authMiddleware } = require('../../middleware/authMiddleware');

router.use(authMiddleware, activityTracker)
// Routes
router.route("/")
  .get(getReviews)
  .post(createReview); 

router.route("/:id")
  .put(updateReview)
  .delete(deleteReview);

router.put("/:id/status", changeStatus);

module.exports = router;