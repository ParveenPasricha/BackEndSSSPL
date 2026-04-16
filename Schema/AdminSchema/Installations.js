const mongoose = require ("mongoose");

const installationSchema = new mongoose.Schema({
  title: String,
  image: String,
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
}, { timestamps: true });

module.exports= mongoose.model("Installation", installationSchema);