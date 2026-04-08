const Admin = require("../../Schema/AdminSchema/Login");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendMail = require("../../utils/sendMail");
const jwt = require("jsonwebtoken");
const ActivityLog = require("../../Schema/AdminSchema/ActivityLog");
/* =========================
   ADMIN REGISTER
========================= */
exports.adminRegister = async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  try {
    // Validation
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingAdmin = await Admin.findOne({ adminEmail });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin
    const newAdmin = new Admin({
      adminEmail,
      adminPassword: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      adminId: newAdmin._id,
      adminEmail: newAdmin.adminEmail,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   ADMIN LOGIN
========================= */
exports.adminLogin = async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  try {
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const admin = await Admin.findOne({ adminEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.adminPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const log = await ActivityLog.create({
      userId: admin._id,
      role: "admin",
      email: admin.adminEmail,
    });
    

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        logId: log._id, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.adminEmail,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD (SEND EMAIL)
========================= */
exports.forgotPassword = async (req, res) => {
  const { adminEmail } = req.body;

  try {
    if (!adminEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ adminEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not registered" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    admin.resetToken = token;
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await admin.save();

    const frontendUrl =
      process.env.NODE_ENV === "development"
        ? process.env.FRONTEND_URL_LOCAL
        : process.env.FRONTEND_URL_PROD;

    const resetLink = `${frontendUrl}/admin/reset-password/${token}`;

    await sendMail(
      adminEmail,
      "Admin Password Reset",
      `
      <div style="font-family:Arial">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color:#2563eb">Reset Password</a>
        <p>This link is valid for 15 minutes.</p>
      </div>
      `,
    );

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Unable to send reset link" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.adminPassword = hashedPassword;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    const logId = req.user?.logId;

    if (!logId) {
      return res.status(400).json({ message: "No active session found" });
    }

    const log = await ActivityLog.findById(logId);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    log.logoutTime = new Date();

    log.sessionDuration =
      (log.logoutTime - log.loginTime) / 1000;

    await log.save();

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    // Check if user is admin (only admins can view logs)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await ActivityLog.find()
      .sort({ loginTime: -1 })
      .limit(100); // Limit to last 100 logs

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};