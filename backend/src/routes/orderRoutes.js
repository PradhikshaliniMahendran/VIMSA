import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, editOrder, downloadInvoice, adminGetAllOrders, adminUpdateOrderStatus } from '../controllers/orderController.js';
import { getMyReturns, createReturn } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/my', requireAuth, getMyOrders);
router.get('/my/returns', requireAuth, getMyReturns);
router.post('/returns', requireAuth, createReturn);
router.get('/:id', requireAuth, getOrderById);
router.patch('/:id/cancel', requireAuth, cancelOrder);
router.put('/:id', requireAuth, editOrder);
router.get('/:id/invoice', requireAuth, downloadInvoice);

// Admin routes
router.get('/admin/all', requireAdmin, adminGetAllOrders);
router.patch('/admin/:id/status', requireAdmin, adminUpdateOrderStatus);

export default router;
