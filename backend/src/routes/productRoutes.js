import express from 'express';
import { 
  getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, 
  getFeaturedProducts, getTrendingProducts, getBestSellers, getNewArrivals, 
  getFlashSaleProducts, adminGetAllProducts, getAIStatus, retriggerAI 
} from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin/all', requireAdmin, adminGetAllProducts);
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/flash-sale', getFlashSaleProducts);

// AI virtual try-on route status & retrigger
router.get('/:id/ai-status', getAIStatus);
router.post('/:id/generate-ai', requireAdmin, retriggerAI);

router.get('/:slug', getProductBySlug);
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
