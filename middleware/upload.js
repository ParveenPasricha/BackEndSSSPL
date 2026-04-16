const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");


// ================= MAIN STORAGE =================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    let folder = "others";

    if (req.originalUrl.includes("products")) folder = "products";
    else if (req.originalUrl.includes("testnomial") || req.originalUrl.includes("testimonials")) folder = "testimonials";
    else if (req.originalUrl.includes("reviews")) folder = "reviews";
    else if (req.originalUrl.includes("blogs")) folder = "blogs";
    else if (req.originalUrl.includes("user")) folder = "users";
    else if (req.originalUrl.includes("diagnosis") || req.originalUrl.includes("report") || req.originalUrl.includes("patient")) folder = "medical-reports";
    else if (req.originalUrl.includes("slider")) folder = "sliders";
    else if (req.originalUrl.includes("installations")) folder = "installations";

    const ext = file.originalname.split(".").pop().toLowerCase();
    const videoFormats = ["mp4", "mov", "webm", "avi", "mkv", "ogg"];

    const resource_type = videoFormats.includes(ext) ? "video" : "auto";

    return {
      folder: folder,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "mp4",
        "webm",
        "mov",
        "avi",
        "mkv",
        "ogg",
        "pdf"
      ],
      public_id: Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),
      resource_type: resource_type
    };
  }
});


// ================= FILE FILTER =================

const fileFilter = (req, file, cb) => {

  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "audio/ogg",
    "application/pdf"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, videos and PDF files are allowed!"));
  }

};


// ================= MAIN UPLOAD =================

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});


// ================= MEDICAL STORAGE =================

const medicalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    const patientName = req.body.patientName || req.body.username || "patient";
    const reportType = req.body.reportType || "report";

    const cleanName =
      patientName.replace(/\s+/g, "_") +
      "_" +
      reportType.replace(/\s+/g, "_");

    return {
      folder: "medical-reports",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      public_id: cleanName + "_" + Date.now(),
      resource_type: "auto"
    };
  }
});


// ================= MEDICAL FILE FILTER =================

const medicalFileFilter = (req, file, cb) => {

  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Medical reports: Only JPG, PNG, WebP and PDF files are allowed!"));
  }

};


// ================= MEDICAL UPLOAD =================

const medicalUpload = multer({
  storage: medicalStorage,
  fileFilter: medicalFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});


// ================= EXPORTS =================

module.exports = upload;
module.exports.medicalUpload = medicalUpload;
module.exports.singleMedicalUpload = medicalUpload.single("reportFile");
module.exports.multipleMedicalUpload = medicalUpload.array("reportFiles", 5);