const ActivityLog = require("../Schema/AdminSchema/ActivityLog");

const activityTracker = async (req, res, next) => {
  try {
    console.log("=== ACTIVITY TRACKER ===");
    console.log("User in activityTracker:", req.user);
    console.log("Request path:", req.path);
    console.log("Request method:", req.method);

    const logId = req.user?.logId;

    if (!logId) {
      console.log("❌ No logId found, skipping activity tracking");
      return next();
    }

    // Don't track OPTIONS requests
    if (req.method === "OPTIONS") {
      console.log("⏭️ Skipping OPTIONS request");
      return next();
    }

    // Exclude certain routes from tracking
    const excludePaths = ["/admin/activity-logs", "/admin/logout"];
    if (excludePaths.includes(req.path)) {
      console.log(`⏭️ Skipping excluded path: ${req.path}`);
      return next();
    }

    const actionDetails = req.method === "GET" ? "GET request" : "Data Modified";
    const actionDescription = `${req.method} ${req.originalUrl || req.path}`;
    
    console.log(`📝 Tracking action: ${actionDescription}`);
    console.log(`📝 Details: ${actionDetails}`);
    console.log(`📝 LogId: ${logId}`);

    const updatedLog = await ActivityLog.findByIdAndUpdate(
      logId,
      {
        $push: {
          actions: {
            action: actionDescription,
            details: actionDetails, 
            time: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!updatedLog) {
      console.log("❌ Log not found for logId:", logId);
    } else {
      console.log(`✅ Activity tracked: ${req.method} ${req.path}`);
      console.log(`📊 Actions count now: ${updatedLog.actions?.length || 0}`);
    }
  } catch (error) {
    console.error("❌ Activity tracking error:", error.message);
    console.error("Stack:", error.stack);
  }

  next();
};

module.exports = activityTracker;
