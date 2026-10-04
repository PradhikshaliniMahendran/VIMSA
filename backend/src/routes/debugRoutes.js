import express from 'express';
import { Order } from '../models/OrderSchema.js';

const router = express.Router();

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort('-createdAt').lean();
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(o => ({
        id: o._id,
        orderNumber: o.orderNumber,
        customer: o.customer,
        status: o.orderStatus,
        total: o.total,
        createdAt: o.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
