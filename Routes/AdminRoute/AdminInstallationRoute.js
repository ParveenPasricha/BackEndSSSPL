const express = require("express");
const {
  getInstallations,
  createInstallation,
  toggleInstallationStatus,
  deleteInstallation
} = require("../../Controller/AdminController/InstallationController");

const upload = require("../../middleware/upload");
const { authMiddleware } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");

const router = express.Router();

/* PUBLIC */
router.get("/", getInstallations);

/* PROTECTED */
router.use(authMiddleware, activityTracker);

router.post("/", upload.single("image"), createInstallation);
router.put("/:id/status", toggleInstallationStatus);
router.delete("/:id", deleteInstallation);

module.exports = router;