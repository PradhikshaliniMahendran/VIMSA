import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Store Settings
  storeName: { type: String, default: 'VIMSA' },
  whatsappNumber: { type: String, default: '+94771234567' },
  contactNumber: { type: String, default: '+94771234567' },
  email: { type: String, default: 'info@vimsa.lk' },
  address: { type: String, default: 'Colombo, Sri Lanka' },
  facebookUrl: { type: String, default: 'https://facebook.com/vimsa' },
  instagramUrl: { type: String, default: 'https://instagram.com/vimsa' },
  whatsappUrl: { type: String, default: 'https://wa.me/94771234567' },

  // Shipping Settings
  shippingFee: { type: Number, required: true, default: 350 },
  freeShippingThreshold: { type: Number, required: true, default: 15000 },
  
  // Flash Sale Settings
  flashSaleActive: { type: Boolean, required: true, default: false },
  flashSaleEndDate: { type: Date },
  flashSaleTitle: { type: String, required: true, default: 'VIMSA Flash Sale' },
  flashSaleDiscountText: { type: String, required: true, default: '30% OFF' },
}, { timestamps: true });

// We only need one global settings document, but Mongoose doesn't have a "singleton" feature natively.
// We'll enforce it in the controller.
export const Settings = mongoose.model('Settings', settingsSchema);
