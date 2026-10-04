import express from 'express';
import {
  stripePaymentIntent,
  stripeCheckoutSession,
  stripeWebhook,
  payhereNotify,
  payhereCheckoutParams,
  verifyCOD,
  paypalCreateOrder,
  paypalCapturePayment
} from '../controllers/paymentController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/stripe/intent', requireAuth, stripePaymentIntent);
router.post('/stripe/checkout-session', requireAuth, stripeCheckoutSession);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/paypal/create', requireAuth, paypalCreateOrder);
router.post('/paypal/capture', requireAuth, paypalCapturePayment);
router.post('/payhere/params', requireAuth, payhereCheckoutParams);
router.post('/payhere/notify', payhereNotify);
router.patch('/cod/:orderId/verify', requireAdmin, verifyCOD);

export default router;
