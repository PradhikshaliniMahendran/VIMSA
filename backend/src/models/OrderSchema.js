import mongoose from 'mongoose';

// OrderItem Schema
const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  size: { type: String },
  color: { type: String },
  image: { type: String }
}, { timestamps: true });

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);

// Shipping Schema (shipping methods, zones, costs)
const shippingSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Standard Delivery, Fast Express
  carrier: { type: String, required: true }, // e.g. DHL, Pronto, Domex
  cost: { type: Number, required: true, default: 0 },
  minDays: { type: Number, required: true },
  maxDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Shipping = mongoose.model('Shipping', shippingSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }], // Links to OrderItem collection
  shippingAddress: {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  billingAddress: {
    fullName: { type: String },
    mobileNumber: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    district: { type: String },
    province: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  shippingMethod: { type: String, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  couponUsed: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'payhere', 'stripe', 'paypal', 'card'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'payment_pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'return_requested', 'returned'], 
    default: 'pending' 
  },
  trackingNumber: { type: String },
  carrier: { type: String },
  estimatedDelivery: { type: Date },
  invoicePdfUrl: { type: String }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'LKR' },
  paymentMethod: { type: String, required: true },
  paymentGateway: { type: String }, // Stripe, PayPal, PayHere
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed } // Save full response for records
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);

// Transaction Schema (For detailed ledger tracing)
const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'LKR' },
  gateway: { type: String, required: true }, // PayHere, Stripe, PayPal, COD
  status: { type: String, required: true }, // success, pending, failed
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);

// Return Schema
const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  reason: { type: String, required: true },
  images: [{ type: String }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'refunded'], 
    default: 'pending' 
  },
  adminNotes: { type: String }
}, { timestamps: true });

export const Return = mongoose.model('Return', returnSchema);

// Refund Schema
const refundSchema = new mongoose.Schema({
  returnRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Return', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'LKR' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'refunded'], default: 'pending' },
  reason: { type: String },
  refundDate: { type: Date }
}, { timestamps: true });

export const Refund = mongoose.model('Refund', refundSchema);
