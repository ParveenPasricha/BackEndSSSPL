const { default: mongoose } = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Product = require('../../Schema/AdminSchema/Product');

// ========== PRODUCT ==========
// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json({ status: true, data: products });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { product_id: id }] };
    } else {
      query = { product_id: id };
    }
    const product = await Product.findOne(query).lean();
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const payload = req.body;
    // ***************************************** for local server used *****************************************
    // const imagePaths = req.files
    //   ? req.files.map(file => `/uploads/products/${file.filename}`)
    //   : [];

    const imagePaths = req.files ? req.files.map(file => file.path): [];
    const exists = await Product.findOne({ product_id: payload.product_id });
    if (exists) {
      return res.status(400).json({ status: false, message: "Duplicate product_id" });
    }

    const p = new Product({
      ...payload,
      product_id: payload.product_id || uuidv4(),
      title: payload.title || payload.product_name,
      price: Number(payload.price),
      images: imagePaths,
      product_status: payload.product_status === "true"
    });

    await p.save();
    res.status(201).json({ status: true, data: p });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};


// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    if (req.files && req.files.length > 0) {
      // payload.images = req.files.map(file => `/uploads/products/${file.filename}`);
      payload.images = req.files.map(file => file.path);
    }

    const product = await Product.findOneAndUpdate(
      { $or: [{ product_id: id }, { _id: id }] }, 
      payload, 
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOneAndDelete({ $or: [{ product_id: id }, { _id: id }] });
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// POST /api/products/:id/reviews  (add review)
exports.addReview = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body; // should be review object
    const product = await Product.findOne({$or: [{ _id: id }, { product_id: id }]});
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    product.reviews.push(payload);
    await product.save();
    res.json({ status: true, data: product.reviews });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ========== BENEFITS ==========
exports.addBenefit = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    
    // Handle image upload
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    payload.id = `BEN-${Date.now()}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { benefits: payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.benefits });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateBenefit = async (req, res) => {
  try {
    const { id, benefitId } = req.params;
    const payload = req.body;
    
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }], "benefits.id": benefitId },
      { $set: { "benefits.$": payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Benefit not found' });
    res.json({ status: true, data: product.benefits });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteBenefit = async (req, res) => {
  try {
    const { id, benefitId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { benefits: { id: benefitId } } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.benefits });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========== HOW TO USE ==========
exports.addHowToUse = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    payload.id = `HTU-${Date.now()}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { how_to_use: payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.how_to_use });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateHowToUse = async (req, res) => {
  try {
    const { id, howToUseId } = req.params;
    const payload = req.body;
    
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }], "how_to_use.id": howToUseId },
      { $set: { "how_to_use.$": payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'How to Use not found' });
    res.json({ status: true, data: product.how_to_use });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteHowToUse = async (req, res) => {
  try {
    const { id, howToUseId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { how_to_use: { id: howToUseId } } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.how_to_use });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========== FAQS ==========
exports.addFAQ = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    
    payload.id = `FAQ-${Date.now()}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { f_and_q: payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.f_and_q });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { id, faqId } = req.params;
    const payload = req.body;
    
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }], "f_and_q.id": faqId },
      { $set: { "f_and_q.$": payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'FAQ not found' });
    res.json({ status: true, data: product.f_and_q });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const { id, faqId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { f_and_q: { id: faqId } } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.f_and_q });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========== PACKS ==========
exports.addPack = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    payload.id = `PACK-${Date.now()}`;
    payload.show_status = payload.show_status || "1";
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { packs_data: payload } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.packs_data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
// ========== PACKS ==========
exports.updatePack = async (req, res) => {
  try {
    const { id, packId } = req.params;
    const payload = req.body;
    
    console.log("Updating pack:", { productId: id, packId, payload });
    
    if (req.file) {
      payload.image = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    delete payload.id;
    const updateFields = {};
    Object.keys(payload).forEach(key => {
      updateFields[`packs_data.$.${key}`] = payload[key];
    });
    
    const product = await Product.findOneAndUpdate(
      { 
        $or: [{ _id: id }, { product_id: id }],
        "packs_data.id": packId 
      },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Product not found or pack not found'
      });
    }
    
    console.log("Pack updated successfully");
    
    res.json({
      status: true,
      data: product.packs_data
    });
    
  } catch (err) {
    console.error("Update Pack Error:", err);
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

exports.deletePack = async (req, res) => {
  try {
    const { id, packId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { packs_data: { id: packId } } },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product.packs_data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========== PRIMARY FOODS FUNCTIONS ==========

// Add Primary Food
exports.addPrimaryFood = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Handle image upload
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    // Generate unique ID
    payload.id = `PF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    // Find product and update
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { "foods_to_avoid.primary_foods": payload } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.primary_foods 
    });
    
  } catch (err) {
    console.error("Add Primary Food Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Update Primary Food
exports.updatePrimaryFood = async (req, res) => {
  try {
    const { id, foodId } = req.params;
    const payload = req.body;
    
    // Handle new image upload
    if (req.file) {
      payload.image = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    // IMPORTANT: Sirf specific fields update karo, poori array nahi
    const updateFields = {};
    Object.keys(payload).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields[`foods_to_avoid.primary_foods.$.${key}`] = payload[key];
      }
    });
    
    // Update using positional operator
    const product = await Product.findOneAndUpdate(
      { 
        $or: [{ _id: id }, { product_id: id }],
        "foods_to_avoid.primary_foods.id": foodId 
      },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found or food item not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.primary_foods 
    });
    
  } catch (err) {
    console.error("Update Primary Food Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Delete Primary Food
exports.deletePrimaryFood = async (req, res) => {
  try {
    const { id, foodId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { "foods_to_avoid.primary_foods": { id: foodId } } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.primary_foods 
    });
    
  } catch (err) {
    console.error("Delete Primary Food Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// ========== FRUITS FUNCTIONS ==========

// Add Fruit
exports.addFruit = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Handle image upload
    if (req.file) {
      // payload.image = `/uploads/products/${req.file.filename}`;
      payload.image = req.file.path;
    }
    
    // Generate unique ID
    payload.id = `FR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    // Find product and update
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { "foods_to_avoid.fruits": payload } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.fruits 
    });
    
  } catch (err) {
    console.error("Add Fruit Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Update Fruit
exports.updateFruit = async (req, res) => {
  try {
    const { id, fruitId } = req.params;
    const payload = req.body;
    
    // Handle new image upload
    if (req.file) {
      payload.image = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    // IMPORTANT: Sirf specific fields update karo, poori array nahi
    const updateFields = {};
    Object.keys(payload).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields[`foods_to_avoid.fruits.$.${key}`] = payload[key];
      }
    });
    
    // Update using positional operator
    const product = await Product.findOneAndUpdate(
      { 
        $or: [{ _id: id }, { product_id: id }],
        "foods_to_avoid.fruits.id": fruitId 
      },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found or fruit not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.fruits 
    });
    
  } catch (err) {
    console.error("Update Fruit Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Delete Fruit
exports.deleteFruit = async (req, res) => {
  try {
    const { id, fruitId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { "foods_to_avoid.fruits": { id: fruitId } } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid.fruits 
    });
    
  } catch (err) {
    console.error("Delete Fruit Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Optional: Update entire foods_to_avoid section at once
exports.updateFoodsToAvoid = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $set: { foods_to_avoid: payload } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.foods_to_avoid 
    });
    
  } catch (err) {
    console.error("Update Foods to Avoid Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};
exports.addClinicalValidation = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    if (req.file) {
      // payload.imageUrl = `/uploads/products/${req.file.filename}`;
      payload.imageUrl = req.file.path;
    }
    
    payload.id = `CV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $push: { clinical_validation: payload } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.clinical_validation 
    });
    
  } catch (err) {
    console.error("Add Clinical Validation Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};

// Update Clinical Validation
exports.updateClinicalValidation = async (req, res) => {
  try {
    const { id, validationId } = req.params;
    const payload = req.body;
    
    if (req.file) {
      payload.imageUrl = req.file.path;
    }
    
    payload.updated_at = new Date().toISOString();
    
    // Sirf specific fields update karo
    const updateFields = {};
    Object.keys(payload).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields[`clinical_validation.$.${key}`] = payload[key];
      }
    });
    
    const product = await Product.findOneAndUpdate(
      { 
        $or: [{ _id: id }, { product_id: id }],
        "clinical_validation.id": validationId 
      },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found or validation not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.clinical_validation 
    });
    
  } catch (err) {
    console.error("Update Clinical Validation Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};
exports.deleteClinicalValidation = async (req, res) => {
  try {
    const { id, validationId } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { product_id: id }] },
      { $pull: { clinical_validation: { id: validationId } } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        status: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      status: true, 
      data: product.clinical_validation 
    });
    
  } catch (err) {
    console.error("Delete Clinical Validation Error:", err);
    res.status(500).json({ 
      status: false, 
      message: err.message 
    });
  }
};