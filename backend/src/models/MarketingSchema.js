import mongoose from 'mongoose';

// Cart Schema (Server side cart synchronization)
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true } // Captured at time of adding or live updating
  }]
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);

// Wishlist Schema (Server side wishlist)
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['flat', 'percentage'], required: true },
  value: { type: Number, required: true }, // e.g. 500 for Rs.500 or 15 for 15%
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number }, // Caps percentage discounts
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 },
  usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' } // Auto-approve or queue for moderation
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'payment', 'marketing', 'security'], default: 'order' },
  read: { type: Boolean, default: false },
  link: { type: String } // e.g. /dashboard/orders/123
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);

// Newsletter Subscriber Schema
const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' }
}, { timestamps: true });

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

// Contact Message Schema (Contact Us form submissions)
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  adminNotes: { type: String }
}, { timestamps: true });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Promotion Schema (Promotional Offer Popup)
const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  discountText: { type: String, trim: true },
  bannerImage: { type: String },
  ctaText: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: '/shop?type=DRESS' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Promotion = mongoose.model('Promotion', promotionSchema);
