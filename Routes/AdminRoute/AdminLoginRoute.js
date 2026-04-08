const express = require("express");
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  forgotPassword,
  resetPassword,
  adminLogout,
  getActivityLogs
} = require("../../Controller/AdminController/AdminLoginController");
const { authMiddleware, authorizeRole } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker"); 


// Routes
router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", authMiddleware, activityTracker,adminLogout);
router.get("/activity-logs", authMiddleware, authorizeRole("admin"),getActivityLogs);

module.exports = router;
