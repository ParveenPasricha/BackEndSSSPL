const jwt = require("jsonwebtoken");
const User = require("../../Schema/UserSchema/userSchema");

// ================= SEND OTP =================
exports.requestOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Valid mobile number required",
      });
    }
    
    let user = await User.findOne({ mobile });

    if (!user) {
      user = new User({ mobile });
      await user.save({ validateBeforeSave: false });
    }


    // Check if OTP is blocked
    if (
      user.otpBlockedUntil &&
      user.otpBlockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message: "OTP temporarily blocked. Try again later.",
      });
    }

    // Generate random OTP
    const otp = "101010"

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    user.otpAttempts = 0;
    user.otpBlockedUntil = null;

    await user.save();

    // ⚠️ Replace this with SMS API
    console.log(`OTP for ${mobile}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      isRegistered: !!(user.name && user.email),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name, email } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Check block
    if (
      user.otpBlockedUntil &&
      user.otpBlockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message: "OTP blocked. Try again later.",
      });
    }

    // OTP expired
    if (!user.otp || user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // OTP mismatch
    if (user.otp !== otp) {
      user.otpAttempts += 1;

      // Block after 5 attempts
      if (user.otpAttempts >= 5) {
        user.otpBlockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        ); // 15 minutes
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ================= NEW USER DETAILS =================
    if (!user.name || !user.email) {
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and Email required",
        });
      }

      const emailExists = await User.findOne({
        email,
        mobile: { $ne: mobile },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.name = name;
      user.email = email;
    }

    // Clear OTP data
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.otpBlockedUntil = null;

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send safe user data only
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
