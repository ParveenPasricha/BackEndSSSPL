const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewDate: {
      type: Date,
      default: Date.now, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);