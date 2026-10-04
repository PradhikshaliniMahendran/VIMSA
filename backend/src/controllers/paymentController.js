import crypto from 'crypto';
import Stripe from 'stripe';
import { Order, Payment, Transaction } from '../models/OrderSchema.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate({ path: 'items', populate: { path: 'product' } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Transform order items into Stripe line items
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'lkr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Append shipping cost if any
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'lkr',
          product_data: {
            name: 'Shipping Fee',
          },
          unit_amount: Math.round(order.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Append discount if any
    if (order.discount > 0) {
      lineItems.push({
        price_data: {
          currency: 'lkr',
          product_data: {
            name: 'Coupon Discount',
          },
          unit_amount: Math.round(-order.discount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-tracking?orderId=${order._id}&paymentStatus=success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?orderId=${order._id}&paymentStatus=cancelled`,
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (err) { next(err); }
};

export const stripePaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'lkr',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    res.json({ success: true, data: { clientSecret: intent.client_secret } });
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId } = session.metadata;
      
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });
      await Payment.findOneAndUpdate({ order: orderId }, { paymentStatus: 'success', transactionId: session.id });
      
      const order = await Order.findById(orderId);
      if (order) {
        await Transaction.create({
          transactionId: session.id,
          order: orderId,
          customer: order.customer,
          amount: order.total,
          currency: 'LKR',
          gateway: 'stripe',
          status: 'success',
        });
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const { orderId } = intent.metadata;
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });
      await Payment.findOneAndUpdate({ order: orderId }, { paymentStatus: 'success', transactionId: intent.id });
      await Transaction.create({
        transactionId: intent.id, order: orderId,
        customer: (await Order.findById(orderId)).customer,
        amount: intent.amount / 100, currency: 'LKR',
        gateway: 'stripe', status: 'success',
      });
    }
    res.json({ received: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const payhereNotify = async (req, res, next) => {
  try {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localSig = crypto.createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
      .digest('hex').toUpperCase();

    if (localSig !== md5sig) return res.status(400).json({ success: false, message: 'Invalid signature' });

    if (status_code === '2') {
      await Order.findByIdAndUpdate(order_id, { paymentStatus: 'paid', orderStatus: 'confirmed' });
      await Payment.findOneAndUpdate({ order: order_id }, { paymentStatus: 'success', paymentGateway: 'payhere' });
    }
    res.sendStatus(200);
  } catch (err) { next(err); }
};

export const verifyCOD = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: 'confirmed' },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'COD order confirmed', data: { order } });
  } catch (err) { next(err); }
};

export const paypalCreateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Get PayPal access token
    const authRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}` },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await authRes.json();

    const ppOrder = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ reference_id: order._id.toString(), amount: { currency_code: 'USD', value: (order.total / 320).toFixed(2) } }],
      }),
    });
    const ppData = await ppOrder.json();
    const approvalUrl = ppData.links?.find(l => l.rel === 'approve')?.href;

    res.json({ success: true, data: { paypalOrderId: ppData.id, approvalUrl } });
  } catch (err) { next(err); }
};

export const paypalCapturePayment = async (req, res, next) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    const authRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}` },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await authRes.json();
    const capture = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
    });
    const captureData = await capture.json();

    if (captureData.status === 'COMPLETED') {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });
      await Payment.findOneAndUpdate({ order: orderId }, { paymentStatus: 'success', paymentGateway: 'paypal', transactionId: captureData.id });
    }
    res.json({ success: true, data: { captureData } });
  } catch (err) { next(err); }
};

export const payhereCheckoutParams = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1215886';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'mock_merchant_secret';
    const currency = 'LKR';
    const amountFormatted = order.total.toFixed(2);

    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hash = crypto.createHash('md5')
      .update(merchantId + order._id.toString() + amountFormatted + currency + secretHash)
      .digest('hex').toUpperCase();

    res.json({
      success: true,
      data: {
        merchantId,
        orderId: order._id.toString(),
        items: `VIMSA Order ${order.orderNumber}`,
        amount: amountFormatted,
        currency,
        hash,
        firstName: order.customer?.firstName || 'Customer',
        lastName: order.customer?.lastName || 'VIMSA',
        email: order.customer?.email || 'customer@vimsa.com',
        phone: order.shippingAddress?.mobileNumber || '',
        address: order.shippingAddress?.addressLine1 || '',
        city: order.shippingAddress?.city || '',
        country: 'Sri Lanka',
        returnUrl: `${process.env.FRONTEND_URL}/order-tracking?orderId=${order._id}&paymentStatus=success`,
        cancelUrl: `${process.env.FRONTEND_URL}/checkout?orderId=${order._id}&paymentStatus=cancelled`,
        notifyUrl: `${process.env.BACKEND_URL || 'https://backend-zeta-ebon-56.vercel.app'}/api/v1/payments/payhere/notify`
      }
    });
  } catch (err) { next(err); }
};
