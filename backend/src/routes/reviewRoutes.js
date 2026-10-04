import express from 'express';
import { getProductReviews, createReview, deleteReview, getRecentReviews } from '../controllers/reviewController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/recent', getRecentReviews);
router.get('/:productId', getProductReviews);
router.post('/', requireAuth, createReview);
router.delete('/:id', requireAdmin, deleteReview);

export default router;
