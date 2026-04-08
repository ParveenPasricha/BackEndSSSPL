const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ["admin", "sub-admin"], required: true },
    email: String,

    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },

    sessionDuration: { type: Number },

    actions: [
      {
        action: String,
        time: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

function formatTo12Hour(date) {
  if (!date) return null;

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Virtual for login time
activityLogSchema.virtual("loginTimeFormatted").get(function () {
  return formatTo12Hour(this.loginTime);
});

// Virtual for logout time
activityLogSchema.virtual("logoutTimeFormatted").get(function () {
  return formatTo12Hour(this.logoutTime);
});

// Virtual for actions time formatting
activityLogSchema.virtual("actionsFormatted").get(function () {
  return this.actions.map((a) => ({
    ...a._doc,
    timeFormatted: formatTo12Hour(a.time),
  }));
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
