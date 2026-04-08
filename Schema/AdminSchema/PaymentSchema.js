const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Wallet", "Cash"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: ["Completed", "Failed", "Pending"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      unique: true,
    },
    country: {
      type: String,
      default: "India",
    },
    customerName: String,
    orderNumber: String, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);