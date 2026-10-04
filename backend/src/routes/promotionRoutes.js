import express from 'express';
import {
  getActivePromotion,
  adminGetPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion
} from '../controllers/promotionController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route for active promotion popup
router.get('/active', getActivePromotion);

// Admin routes
router.get('/admin', requireAdmin, adminGetPromotions);
router.post('/admin', requireAdmin, adminCreatePromotion);
router.put('/admin/:id', requireAdmin, adminUpdatePromotion);
router.delete('/admin/:id', requireAdmin, adminDeletePromotion);

export default router;
