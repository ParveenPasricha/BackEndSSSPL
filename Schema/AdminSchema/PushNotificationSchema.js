const { default: mongoose } = require("mongoose");

const pushNotification = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    message:{type: String, trim: true, required: true},
    status:{type: String, enum: ["Active", "Inactive"], default: "Active"}
}, {timestamps: true})

module.exports = mongoose.model("Notification", pushNotification)

