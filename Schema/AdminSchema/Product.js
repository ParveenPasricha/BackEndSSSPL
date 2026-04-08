const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReviewSchema = new mongoose.Schema({
  review_id: String,
  user_id: String,
  order_id: String,
  rating: { type: Number, default: 0 },
  file_path: [String],
  message: String,
  date: String,
  fname: String
}, { _id: false });

const BenefitSchema = new mongoose.Schema({
  id: String,
  title: String,
  image: String,
  description: String,
  created_at: String,
  updated_at: String
}, { _id: false });

const HowToUseSchema = new mongoose.Schema({
  id: String,
  title: String,
  step_number: String,
  description: String,
  image: String,
  created_at: String,
  updated_at: String
}, { _id: false });

const FAQSchema = new mongoose.Schema({
  id: String,
  question: String,
  answer: String,
  created_at: String,
  updated_at: String
}, { _id: false });

const PackSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  pack_name: String,
  base_price: String,
  price: String,
  sku_id: String,
  disscount: String,
  quantity: String,
  description: String,
  image: String,
  show_status: String,
  created_at: String,
  updated_at: String
}, { _id: false });

const FoodItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String },
  description: { type: String, required: true },
  alternative: { type: String, required: true },
  order: { type: Number, default: 0 },
  created_at: { type: String },
  updated_at: { type: String }
}, { _id: false });

const ClinicalValidationSchema = new mongoose.Schema({
  id:{type: String, required: true},
  badge: {type: String, required: true},
  title:{type: String, required: true},
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  buttonText: { type: String, default: "View Certificate" },
  order: { type: Number, default: 0 },
  created_at: { type: String },
  updated_at: { type: String }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  product_id: { type: String, unique: true, required: true },
  product_name: String,
  title: { type: String, required: [true, "Title is required"] },
  slug: { type: String },
  description: String,
  price: Number,
  images: [String],
  product_status: { type: Boolean, default: true }, 
  gst_price: String,
  reviews: [ReviewSchema],
  benefits: [BenefitSchema],
  how_to_use: [HowToUseSchema],
  f_and_q: [FAQSchema],
  packs_data: [PackSchema],
  foods_to_avoid: {primary_foods: [FoodItemSchema],fruits: [FoodItemSchema],is_active: { type: Boolean, default: true }},
  clinical_validation: [ClinicalValidationSchema],
  category: {
    id: Number,
    name: String,
    slug: String,
    image: String,
    creationAt: Date,
    updatedAt: Date
  }
}, { timestamps: { createdAt: 'creationAt', updatedAt: 'updatedAt' } });


module.exports = mongoose.model('Product', ProductSchema);
