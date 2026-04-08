const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema(
  {
    title: {type: String,required: true,trim: true,},
    subtitle: {type: String,required: true,trim: true},
    display_order: {type: Number,required: true,},
    image: {type: String, required: true,},
    status: {type: String, enum: ["pending", "active", "rejected"], default: "pending",},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slider", SliderSchema);
