const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  video: {
    type: String,
    required: true
  },
  publishedBy: {
    type: String, 
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive"
  }
}, { timestamps: true });

module.exports = mongoose.model("testimonial", testimonialSchema);
