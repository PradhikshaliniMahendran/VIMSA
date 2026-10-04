import express from 'express';
import { validateCoupon, adminCreateCoupon, adminGetAllCoupons, adminDeleteCoupon } from '../controllers/couponController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', requireAuth, validateCoupon);
router.get('/admin', requireAdmin, adminGetAllCoupons);
router.post('/admin', requireAdmin, adminCreateCoupon);
router.delete('/admin/:id', requireAdmin, adminDeleteCoupon);

export default router;
