const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },
    
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[6-9]\d{9}$/, // Indian mobile validation
    },

    // OTP Auth
    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    otpBlockedUntil: {
      type: Date,
      default: null,
    },

    // User Status
    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "sub-admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false, // removes __v
  },
);

module.exports = mongoose.model("User", userSchema);
