const express = require("express");
const router = express.Router();
const {
  combinedLogin,
  combinedForgotPassword,
  combinedResetPassword,
  getProfile
} = require("../../Controller/AdminController/CombinedLoginController");
const { authMiddleware } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");

router.post("/login", combinedLogin);
router.post("/forgot-password", combinedForgotPassword);
router.post("/reset-password/:role/:token", combinedResetPassword);

router.use(authMiddleware, activityTracker);

router.get("/profile", getProfile);

module.exports = router;