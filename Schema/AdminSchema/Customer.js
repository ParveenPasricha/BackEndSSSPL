const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, required: true,},
    name: { type: String, required: true,},
    contact: { type: String, required: true,},
    country: {type: String, required: true,},
    registered: {type: Date, default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
