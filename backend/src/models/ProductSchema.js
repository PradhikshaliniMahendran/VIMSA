import mongoose from 'mongoose';

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  division: { type: String, enum: ['DRESS', 'PLASTIC', 'BOTH'], default: 'DRESS' },
  description: { type: String },
  image: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  logo: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export const Brand = mongoose.model('Brand', brandSchema);

// Collection Schema (e.g. Streetwear 2026, Limited Edition Hoodies)
const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  bannerImage: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export const Collection = mongoose.model('Collection', collectionSchema);

// Inventory Schema (Detailing warehouse adjustments, logs, and stock transactions)
const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved: { type: Number, default: 0 }, // Stock allocated to pending/processing orders
  location: { type: String, default: 'Main Warehouse' },
  history: [{
    change: { type: Number, required: true }, // e.g. +50, -10
    reason: { type: String }, // e.g. 'restock', 'order_fulfilled', 'damaged'
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // e.g. Order ID
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  collectionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }, // collection field renamed collectionRef to avoid conflicts with mongo naming
  tags: [{ type: String }],
  images: [{ type: String, required: true }], // Cloudinary URLs
  gallery: [{ type: String }], // Optional wider image gallery
  videoUrl: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  stockQuantity: { type: Number, required: true, default: 0 },
  weight: { type: Number }, // in grams/kg for shipping
  material: { type: String },
  colors: [{ type: String }], // Hex codes or names (e.g. #000000, Black)
  colorImages: { type: Map, of: String },
  specifications: [{ 
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  sizes: [{
    name: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number, required: true, default: 0 }
  }], // e.g. [{ name: 'S', stock: 10 }, { name: 'M', stock: 5 }]
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],
  aiGenerationStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  },
  aiPredictionIds: {
    front: { type: String },
    back: { type: String },
    side: { type: String }
  },
  aiGenerationError: { type: String },
  productType: { 
    type: String, 
    enum: ['DRESS', 'PLASTIC', 'clothing', 'general'], 
    default: 'DRESS' 
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'out_of_stock', 'archived'], 
    default: 'active' 
  }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
