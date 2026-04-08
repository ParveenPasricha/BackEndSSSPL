const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { requestOtp,verifyOtp} = require("../../Controller/UserController/userGetController");
const userProtect = require("../../middleware/userAuthMiddleware");
const { getProfile, updateProfile, getCustomers } = require("../../Controller/UserController/userProfileController");

// ================= OTP RATE LIMITER =================
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many OTP requests. Try again after 5 minutes.",
  },
});

// ================= OTP ROUTES =================
router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

router.get("/profile", userProtect, getProfile);
router.put("/profile", userProtect, updateProfile);

// getall customer
router.get("/ourcustomer", getCustomers);

module.exports = router;


