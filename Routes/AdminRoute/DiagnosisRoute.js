const express = require("express");
const router = express.Router();
const {
  submitDiagnosis,
  uploadMedicalReport,
  getDiagnosisByPhone,
  getAllDiagnosis,
  getDiagnosisById,
  updateDiagnosisStatus,
  getDiagnosisStats,
  deleteDiagnosis,
} = require("../../Controller/AdminController/DiagnosisController");

// Import multer upload middleware
const { singleMedicalUpload } = require("../../middleware/upload");
const activityTracker = require("../../middleware/activityTracker");
const { authMiddleware } = require("../../middleware/authMiddleware");

// Public Routes
router.post("/upload-report", singleMedicalUpload, uploadMedicalReport);
router.post("/submit", submitDiagnosis);
router.get("/phone/:phone", getDiagnosisByPhone);
router.use(authMiddleware, activityTracker);

// Admin/Protected Routes
router.get("/all", getAllDiagnosis);
router.get("/stats", getDiagnosisStats);
router.get("/:id", getDiagnosisById);
router.put("/:id/status", updateDiagnosisStatus);
router.delete("/:id", deleteDiagnosis);

module.exports = router;
