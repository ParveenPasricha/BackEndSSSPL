const express = require("express");
const router = express.Router();
const { 
  getCoupons, 
  getActiveCoupons, 
  validateCoupon, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
} = require("../../Controller/AdminController/couponController");
const { authMiddleware, authorizeRole, checkPermission } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");

// ========== PUBLIC ROUTES ==========
router.get("/active", getActiveCoupons);
router.post("/validate", validateCoupon);

// ========== PROTECTED ROUTES WITH TRACKING ==========
router.use(authMiddleware, activityTracker);

// ========== ADMIN/SUB-ADMIN ROUTES ==========
router.get("/", authorizeRole("admin", "sub-admin"), getCoupons);
router.post("/", authorizeRole("admin", "sub-admin"), checkPermission("create_coupon"), createCoupon);
router.put("/:id", authorizeRole("admin", "sub-admin"), checkPermission("edit_coupon"), updateCoupon);
router.delete("/:id", authorizeRole("admin", "sub-admin"), checkPermission("delete_coupon"), deleteCoupon);

module.exports = router;