import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Prevent browser caching for all API routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://frontend-gray-pi-43.vercel.app',
  'https://frontend-gray-pi-43-pradhikshalini-s-projects.vercel.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow any Vercel preview or production URLs belonging to this project
    const isVercelOrigin = origin.endsWith('.vercel.app') && origin.includes('frontend-gray-pi-43');
    const isLocalhost = origin.startsWith('http://localhost:');
    if (allowedOrigins.indexOf(origin) !== -1 || isVercelOrigin || isLocalhost) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes.' },
});

// Body parsing - stripe webhook needs raw body
app.use('/api/v1/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads for local file uploads fallback
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'VIMSA API is running 🚀', timestamp: new Date() }));

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/public', marketingRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/debug', debugRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
