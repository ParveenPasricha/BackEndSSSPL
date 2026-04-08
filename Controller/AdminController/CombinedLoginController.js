const Admin = require("../../Schema/AdminSchema/Login");
const SubAdmin = require("../../Schema/AdminSchema/SubAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
   COMBINED LOGIN (Admin + Sub-Admin)
========================= */
exports.combinedLogin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: "All fields required" 
      });
    }

    let user = null;
    let userRole = null;
    let userData = null;

    // Check based on role
    if (role === "admin") {
      user = await Admin.findOne({ adminEmail: email });
      userRole = "admin";
      
      if (user) {
        const isMatch = await bcrypt.compare(password, user.adminPassword);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        userData = {
          id: user._id,
          email: user.adminEmail,
          role: "admin"
        };
      }
    } 
    else if (role === "sub-admin") {
      user = await SubAdmin.findOne({ email });
      userRole = "sub-admin";
      
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          permissions: user.permissions,
          role: "sub-admin"
        };
      }
    } 
    else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // If user not found
    if (!user) {
      return res.status(404).json({ 
        message: `${userRole} not found` 
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      role: userRole,
      ...(userRole === "sub-admin" && { permissions: user.permissions })
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: userRole === "admin" ? "1h" : "7d" }
    );

    // Response
    res.status(200).json({
      message: `${userRole} login successful`,
      token,
      user: userData,
      role: userRole
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD (Combined)
========================= */
const crypto = require("crypto");
const sendMail = require("../../utils/sendMail");

exports.combinedForgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    let user = null;
    let resetLink = "";
    let frontendUrl = "";

    // Set frontend URL based on environment
    frontendUrl = process.env.NODE_ENV === "development"
      ? process.env.FRONTEND_URL_LOCAL
      : process.env.FRONTEND_URL_PROD;

    if (role === "admin") {
      user = await Admin.findOne({ adminEmail: email });
      resetLink = `${frontendUrl}/reset-password/admin/${token}`;
    } 
    else if (role === "sub-admin") {
      user = await SubAdmin.findOne({ email });
      resetLink = `${frontendUrl}/reset-password/sub-admin/${token}`;
    } 
    else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Update user with reset token
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    await user.save();

    // Send email
    await sendMail(
      email,
      `${role === 'admin' ? 'Admin' : 'Sub-Admin'} Password Reset`,
      `
      <div style="font-family:Arial">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color:#2563eb">Reset Password</a>
        <p>This link is valid for 15 minutes.</p>
        <p><strong>Role:</strong> ${role}</p>
      </div>
      `
    );

    res.status(200).json({ 
      message: `Reset link sent to ${email}` 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Unable to send reset link" });
  }
};

/* =========================
   RESET PASSWORD (Combined)
========================= */
exports.combinedResetPassword = async (req, res) => {
  const { token, role } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    let user = null;
    
    if (role === "admin") {
      user = await Admin.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
    } 
    else if (role === "sub-admin") {
      user = await SubAdmin.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
    } 
    else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password based on role
    if (role === "admin") {
      user.adminPassword = hashedPassword;
    } else {
      user.password = hashedPassword;
    }
    
    // Clear reset token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();

    res.status(200).json({ 
      message: "Password reset successful" 
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET USER PROFILE (Auth Middleware Required)
========================= */
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user; // From auth middleware

    let userData = null;

    if (role === "admin") {
      const admin = await Admin.findById(id).select("-adminPassword");
      if (admin) {
        userData = {
          id: admin._id,
          email: admin.adminEmail,
          role: "admin"
        };
      }
    } 
    else if (role === "sub-admin") {
      const subAdmin = await SubAdmin.findById(id).select("-password");
      if (subAdmin) {
        userData = {
          id: subAdmin._id,
          name: subAdmin.name,
          email: subAdmin.email,
          permissions: subAdmin.permissions,
          role: "sub-admin"
        };
      }
    }

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userData);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};