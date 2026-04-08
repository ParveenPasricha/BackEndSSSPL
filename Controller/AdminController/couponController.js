
const Coupon = require("../../Schema/AdminSchema/Coupon");

// Get all active coupons for checkout suggestions
const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      status: "Active",
      expiry: { $gte: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(3);
    
    res.json(coupons);
  } catch (error) {
    console.error("GET ACTIVE COUPONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch coupons",
      error: error.message
    });
  }
};

// Get all coupons for admin panel
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch coupons",
      error: error.message
    });
  }
};

// Validate coupon for checkout
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      status: "Active",
      expiry: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ 
        valid: false,
        message: "Invalid or expired coupon" 
      });
    }

    // Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        valid: false,
        message: "Coupon usage limit reached"
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percent") {
      discountAmount = (subtotal * coupon.discount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType,
        maxDiscount: coupon.maxDiscount,
        discountAmount,
        message: `₹${discountAmount} off applied!`
      }
    });

  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);
    res.status(500).json({
      valid: false,
      message: "Failed to validate coupon"
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { 
      title,
      code, 
      discount, 
      discountType = "percent", 
      maxDiscount, 
      minOrderValue,
      expiry, 
      status, 
      usageLimit 
    } = req.body;

    // Check if coupon exists
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    // Create new coupon
    const coupon = await Coupon.create({
      title: title || "Special Offer",
      code: code.toUpperCase(),
      discount,
      discountType,
      maxDiscount,
      minOrderValue: minOrderValue || 0,
      expiry,
      status: status || "Active",
      usageLimit,
      usedCount: 0
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    res.status(500).json({ 
      message: "Failed to create coupon",
      error: error.message 
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error("UPDATE COUPON ERROR:", error);
    res.status(500).json({ 
      message: "Failed to update coupon",
      error: error.message 
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon Not Found" });
    }
    
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);
    res.status(500).json({ 
      message: "Failed to delete coupon",
      error: error.message 
    });
  }
};

module.exports = { 
  getCoupons, 
  getActiveCoupons, 
  validateCoupon, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
};