const SubAdmin = require("../../Schema/AdminSchema/SubAdmin");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendMail = require("../../utils/sendMail");
const jwt = require("jsonwebtoken");
const ActivityLog = require("../../Schema/AdminSchema/ActivityLog");

/* =========================
   CREATE SUB-ADMIN
========================= */
const createSubAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    // ✅ CHECK DUPLICATE EMAIL
    const existing = await SubAdmin.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message: "Sub-admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const subAdmin = await SubAdmin.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json(subAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   GET ALL SUB-ADMINS
========================= */
const getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find().sort({ createdAt: -1 });
    res.status(200).json(subAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE SUB-ADMIN
========================= */
const updateSubAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ CHECK EMAIL DUPLICATE (EXCEPT CURRENT ID)
    if (email) {
      const existing = await SubAdmin.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(409).json({
          message: "Email already in use by another sub-admin",
        });
      }
    }

    const data = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const updated = await SubAdmin.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   DELETE SUB-ADMIN
========================= */
const deleteSubAdmin = async (req, res) => {
  try {
    await SubAdmin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Sub-admin deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   SUB-ADMIN LOGIN
========================= */
const subAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin)
      return res.status(404).json({ message: "Sub-admin not found" });

    const isMatch = await bcrypt.compare(password, subAdmin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ FIX: Pehle ActivityLog create karein
    const log = await ActivityLog.create({
      userId: subAdmin._id,
      role: "sub-admin",
      email: subAdmin.email,
    });

    const token = jwt.sign(
      {
        id: subAdmin._id,
        role: "sub-admin",
        logId: log._id, // Ab ye error nahi dega
        permissions: subAdmin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Sub-admin login successful",
      token,
      subAdmin: {
        id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        permissions: subAdmin.permissions,
      },
    });
  } catch (error) {
    console.error("Login Error:", error); // Debugging ke liye
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
const subAdminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin)
      return res.status(404).json({ message: "Sub-admin not found" });

    const token = crypto.randomBytes(32).toString("hex");
    subAdmin.resetToken = token;
    subAdmin.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await subAdmin.save();

    const frontendUrl =
      process.env.NODE_ENV === "development"
        ? process.env.FRONTEND_URL_LOCAL
        : process.env.FRONTEND_URL_PROD;

    const resetLink = `${frontendUrl}/sub-admin/reset-password/${token}`;

    await sendMail(
      email,
      "Sub-Admin Password Reset",
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
    console.error(error);
    res.status(500).json({ message: "Unable to send reset link" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
const subAdminResetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword)
      return res.status(400).json({ message: "Password is required" });

    const subAdmin = await SubAdmin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!subAdmin)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    subAdmin.password = hashedPassword;
    subAdmin.resetToken = undefined;
    subAdmin.resetTokenExpiry = undefined;

    await subAdmin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSubAdmin,
  getSubAdmins,
  updateSubAdmin,
  deleteSubAdmin,
  subAdminLogin,
  subAdminForgotPassword,
  subAdminResetPassword,
};
