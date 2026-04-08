const Review = require("../../Schema/AdminSchema/ReviewSchema.js");
const upload = require("../../middleware/upload.js"); 

const createReview = async (req, res) => {
  try {
    // Use multer middleware for file upload
    const uploadMiddleware = upload.array('files', 4);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      // Log received data for debugging
      console.log("=== CREATE REVIEW REQUEST ===");
      console.log("Request Body:", req.body);
      console.log("Request Files:", req.files);
      
      // For multipart form data, body parser won't parse fields automatically
      // We need to extract from the request
      const { product, customer, rating, review, status } = req.body;
      
      // Debug: Check what we received
      console.log("Extracted fields:");
      console.log("Product:", product);
      console.log("Customer:", customer);
      console.log("Rating:", rating);
      console.log("Review:", review);
      console.log("Status:", status);

      // Validate required fields
      if (!product || !customer || !rating) {
        return res.status(400).json({ 
          success: false, 
          message: "Product, customer, and rating are required" 
        });
      }

      // Prepare files array
      const files = req.files ? req.files.map(file => ({
        filename: file.filename,
        path: file.path.replace(/\\/g, "/"),
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      })) : [];

      // Create review data
      const reviewData = {
        product: product.toString().trim(),
        customer: customer.toString().trim(),
        rating: parseInt(rating),
        review: review ? review.toString().trim() : "",
        status: status || "Pending",
        reviewDate: new Date(),
        files: files
      };

      console.log("Review data to save:", reviewData);

      try {
        const newReview = await Review.create(reviewData);
        
        res.status(201).json({ 
          success: true, 
          message: "Review created successfully",
          data: newReview 
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(400).json({ 
          success: false, 
          message: dbError.message 
        });
      }
    });
  } catch (error) {
    console.error("Create review outer error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

/* GET ALL REVIEWS */
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* UPDATE REVIEW */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/* DELETE REVIEW */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* CHANGE STATUS */
const changeStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.status = req.body.status;
    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    console.error("Change status error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  changeStatus
};