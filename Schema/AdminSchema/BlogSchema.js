const mongoose = require('mongoose')

const BlogSchema = new mongoose.Schema({
    metaTitle: String,
    metaDescription: String,
    metaURL : String,
    image: String,
    title: String,
    category: String,
  content: String,
  status: {
    type: String,
    enum: ["Active", "Inactive", "Draft"],
    default: "Draft",
  },
},{timestamps: true})
module.exports = mongoose.model("Blog", BlogSchema);