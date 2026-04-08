const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String },
  status: {type: String},
  email: { type: String },
  address: { type: String },
  pincode: { type: String },
  country: { type: String, default: "India" },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  addressType: { type: String, default: "Home" },
  productId: { type: String },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  gstRate: { type: Number, default: 18 }, 
  gst: { type: Number, default: 0 },
  total: { type: Number, required: true },
  source: { type: String, default: "Telecaller" },
  status: { 
    type: String, 
    enum: ["Completed", "Pending", "Cancelled", "Awaited"], 
    default: "Pending" 
  },
  date: { type: Date, default: Date.now },
}, { timestamps: true }); 

module.exports = mongoose.model("Order", OrderSchema);
