const express = require("express");
const router = express.Router();

const {
  createSubAdmin,
  getSubAdmins,
  updateSubAdmin,
  deleteSubAdmin,
  subAdminLogin,
  subAdminForgotPassword,
  subAdminResetPassword
} = require("../../Controller/AdminController/SubAdminController");

const { authMiddleware } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");

// ❗ PUBLIC ROUTES (NO TRACKING)
router.post("/login", subAdminLogin);
router.post("/forgot-password", subAdminForgotPassword);
router.post("/reset-password/:token", subAdminResetPassword);

// ✅ PROTECTED + TRACKED ROUTES
router.use(authMiddleware, activityTracker);

router.post("/", createSubAdmin);
router.get("/", getSubAdmins);
router.put("/:id", updateSubAdmin);
router.delete("/:id", deleteSubAdmin);

module.exports = router;