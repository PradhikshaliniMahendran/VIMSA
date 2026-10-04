import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Address Schema
const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'Sri Lanka' },
  isDefaultShipping: { type: Boolean, default: false },
  isDefaultBilling: { type: Boolean, default: false }
}, { timestamps: true });

export const Address = mongoose.model('Address', addressSchema);

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  mobileNumber: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['guest', 'customer', 'admin', 'superadmin'], 
    default: 'customer' 
  },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refreshTokens: [{ type: String }],
  activeSessions: [{
    token: { type: String },
    device: { type: String },
    ip: { type: String },
    loginTime: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Presave password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

// Pending User Schema (Stores data temporarily until OTP is verified)
const pendingUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  verificationOTP: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins (600 seconds)
});

export const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

// Admin User Schema (For dedicated admin sub-roles and activity control)
const adminUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  permissions: [{ type: String }], // 'manage_products', 'manage_orders', etc.
  department: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export const AdminUser = mongoose.model('AdminUser', adminUserSchema);

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. 'login', 'checkout', 'add_wishlist'
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Audit Log Schema (For tracing critical system or admin updates)
const auditLogSchema = new mongoose.Schema({
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. 'delete_product', 'change_role', 'issue_refund'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetCollection: { type: String }, // e.g. 'Products', 'Users'
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
