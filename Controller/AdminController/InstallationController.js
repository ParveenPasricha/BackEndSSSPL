const Installation = require("../../Schema/AdminSchema/Installations");


/* ===== GET ALL ===== */
exports.getInstallations = async (req, res) => {
  try {
    const data = await Installation.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== CREATE ===== */
exports.createInstallation = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // Get Cloudinary URL - multer-storage-cloudinary provides these properties
    const imageUrl = req.file.path || req.file.secure_url;
    
    // If you want to see what's available in req.file, uncomment:
    // console.log("File upload result:", req.file);

    const newItem = new Installation({
      title: req.body.title,
      image: imageUrl  // Use Cloudinary URL
    });

    await newItem.save();
    res.status(201).json(newItem);  // Use 201 for created
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===== DELETE ===== */
exports.deleteInstallation = async (req, res) => {
  try {
    const item = await Installation.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // Optional: Delete from Cloudinary as well
    // You would need to extract public_id from the URL
    // const publicId = item.image.split('/').slice(-2).join('/').split('.')[0];
    // await cloudinary.uploader.destroy(publicId);
    
    await Installation.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== TOGGLE STATUS ===== */
exports.toggleInstallationStatus = async (req, res) => {
  try {
    const item = await Installation.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    item.status = item.status === "Active" ? "Inactive" : "Active";
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};