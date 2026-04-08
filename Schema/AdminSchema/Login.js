const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
