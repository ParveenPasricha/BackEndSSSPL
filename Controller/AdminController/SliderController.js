const Slider = require("../../Schema/AdminSchema/SliderSchema");

/**
 * =====================================
 * 1️⃣ CREATE SLIDER (Admin Upload) - CLOUDINARY VERSION
 * =====================================
 */
const createSlider = async (req, res) => {
  try {
    const { title, subtitle, display_order } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Slider image is required",
      });
    }

    const order = Number(display_order);
    if (isNaN(order)) {
      return res.status(400).json({ 
        success: false,
        message: "Display order must be a number" 
      });
    }

    // 🔥 FIX: Store Cloudinary URL (req.file.path gives Cloudinary URL)
    const imageUrl = req.file.path; // This is Cloudinary URL

    const slider = await Slider.create({
      title,
      subtitle,
      display_order: order,
      image: imageUrl, // Store Cloudinary URL
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Slider uploaded successfully (Waiting for approval)",
      data: slider,
    });
  } catch (error) {
    console.error("Create slider error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * 2️⃣ GET ACTIVE SLIDERS (Website)
 * =====================================
 */
const getActiveSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ status: "active" })
      .sort({ display_order: 1 });

    res.json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * 3️⃣ GET ALL SLIDERS (Admin)
 * =====================================
 */
const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * 4️⃣ UPDATE SLIDER (TEXT + IMAGE) - CLOUDINARY VERSION
 * =====================================
 */
const updateSlider = async (req, res) => {
  try {
    const { title, subtitle, display_order } = req.body;
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    // Update text fields
    if (title !== undefined && title.trim() !== "") slider.title = title;
    if (subtitle !== undefined) slider.subtitle = subtitle;
    
    // Update display_order
    if (display_order !== undefined && display_order !== "") {
      const order = Number(display_order);
      if (!isNaN(order)) {
        slider.display_order = order;
      }
    }

    // 🔥 FIX: Update image with Cloudinary URL
    if (req.file) {
      // req.file.path gives Cloudinary URL
      slider.image = req.file.path;
    }

    await slider.save();

    res.json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });
  } catch (error) {
    console.error("Update slider error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * 5️⃣ UPDATE STATUS (Admin Approval)
 * =====================================
 */
const updateSliderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "active", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    res.json({
      success: true,
      message: "Slider status updated",
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * 6️⃣ DELETE SLIDER
 * =====================================
 */
const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    // 🔥 Note: Cloudinary image delete optional hai
    // Agar delete karna ho to Cloudinary API call karein

    await slider.deleteOne();

    res.json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("Delete slider error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSlider,
  getActiveSliders,
  getAllSliders,
  updateSlider,
  updateSliderStatus,
  deleteSlider,
};