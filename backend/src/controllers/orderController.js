import PDFDocument from 'pdfkit';
import { Order } from '../models/OrderSchema.js';
import { OrderItem } from '../models/OrderSchema.js';
import { Payment } from '../models/OrderSchema.js';
import { Cart } from '../models/MarketingSchema.js';
import { Notification } from '../models/MarketingSchema.js';
import { Coupon } from '../models/MarketingSchema.js';
import { Product } from '../models/ProductSchema.js';
import { User } from '../models/UserSchema.js';
import { generateOrderNumber } from '../utils/helpers.js';
import { sendEmail, orderConfirmationEmail } from '../utils/emailService.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items, shippingAddress, billingAddress,
      shippingMethod, shippingCost = 0,
      paymentMethod, couponCode, tax = 0,
    } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });

    const validatedItems = [];

    // Verify stock availability first and attach actual DB prices
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (dbProduct.status === 'archived' || dbProduct.status === 'draft') {
        return res.status(400).json({ success: false, message: `Product "${dbProduct.name}" is no longer active` });
      }
      let availableStock = dbProduct.stockQuantity;
      let itemPrice = dbProduct.price;
      let itemSalePrice = dbProduct.salePrice || null;

      if (item.size && dbProduct.sizes && dbProduct.sizes.length > 0) {
        const sizeObj = dbProduct.sizes.find(s => s.name === item.size || s === item.size);
        if (sizeObj && typeof sizeObj === 'object') {
          if (sizeObj.stock !== undefined) availableStock = sizeObj.stock;
          if (sizeObj.price) {
            itemPrice = sizeObj.price;
            itemSalePrice = sizeObj.price; // Override both for simplicity
          }
        }
      }

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.name}" (Size: ${item.size || 'Default'}). Available: ${availableStock}`
        });
      }
      
      validatedItems.push({
        ...item,
        price: itemPrice,
        salePrice: itemSalePrice,
        name: dbProduct.name
      });
    }

    // Decrement stock levels
    for (const item of validatedItems) {
      const p = await Product.findById(item.product);
      if (p) {
        p.stockQuantity -= item.quantity;
        if (item.size && p.sizes && p.sizes.length > 0) {
          const sizeIdx = p.sizes.findIndex(s => s.name === item.size || s === item.size);
          if (sizeIdx > -1 && typeof p.sizes[sizeIdx] === 'object' && p.sizes[sizeIdx].stock !== undefined) {
            p.sizes[sizeIdx].stock -= item.quantity;
          }
        }
        await p.save();
      }
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const subtotalForCoupon = validatedItems.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0);
        discount = coupon.discountType === 'flat' ? coupon.value : (subtotalForCoupon * coupon.value) / 100;
        if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
        coupon.usageCount += 1;
        coupon.usersUsed.push(req.user._id);
        await coupon.save();
      }
    }

    const subtotal = validatedItems.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0);
    const total = subtotal - discount + shippingCost + tax;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber, customer: req.user._id,
      shippingAddress, billingAddress: billingAddress || shippingAddress,
      shippingMethod, shippingCost,
      discount, tax, subtotal, total,
      couponUsed: couponCode, paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
    });

    const createdItems = await Promise.all(
      validatedItems.map(item => OrderItem.create({ ...item, order: order._id }))
    );
    order.items = createdItems.map(i => i._id);
    await order.save();

    await Payment.create({
      order: order._id, customer: req.user._id,
      amount: total, currency: 'LKR', paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully',
      message: `Your order ${orderNumber} has been placed.`,
      type: 'order',
      link: `/dashboard/orders/${order._id}`,
    });

    await sendEmail(req.user.email, 'VIMSA – Order Confirmation', orderConfirmationEmail(order));

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id }).sort('-createdAt').skip(skip).limit(+limit).populate({ path: 'items', populate: { path: 'product', select: 'name images' } }),
      Order.countDocuments({ customer: req.user._id }),
    ]);
    res.json({ success: true, data: { orders, total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate({ path: 'items', populate: { path: 'product' } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString() && !['admin','superadmin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id }).populate('items');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'payment_pending', 'confirmed'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });

    // Restore stock levels
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const p = await Product.findById(item.product);
        if (p) {
          p.stockQuantity += item.quantity;
          if (item.size && p.sizes && p.sizes.length > 0) {
            const sizeIdx = p.sizes.findIndex(s => s.name === item.size || s === item.size);
            if (sizeIdx > -1 && typeof p.sizes[sizeIdx] === 'object' && p.sizes[sizeIdx].stock !== undefined) {
              p.sizes[sizeIdx].stock += item.quantity;
            }
          }
          await p.save();
        }
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate({ path: 'items', populate: { path: 'product', select: 'name sku' } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=VIMSA-Invoice-${order.orderNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(28).fillColor('#D4AF37').text('VIMSA', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text('Premium Fashion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#000').text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Order Number: ${order.orderNumber}`).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`).text(`Status: ${order.orderStatus.toUpperCase()}`);
    doc.moveDown();
    doc.text('─'.repeat(80));
    doc.moveDown();

    order.items.forEach(item => {
      doc.text(`${item.name || item.product?.name} x${item.quantity}  —  LKR ${(item.price * item.quantity).toFixed(2)}`);
    });

    doc.moveDown();
    doc.text('─'.repeat(80));
    doc.text(`Subtotal: LKR ${order.subtotal.toFixed(2)}`);
    doc.text(`Discount: LKR ${order.discount.toFixed(2)}`);
    doc.text(`Shipping: LKR ${order.shippingCost.toFixed(2)}`);
    doc.text(`Tax: LKR ${order.tax.toFixed(2)}`);
    doc.fontSize(13).fillColor('#D4AF37').text(`TOTAL: LKR ${order.total.toFixed(2)}`);
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#999').text('Thank you for shopping with VIMSA!', { align: 'center' });
    doc.end();
  } catch (err) { next(err); }
};

export const adminGetAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { orderStatus: status } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').skip(skip).limit(+limit).populate('customer', 'firstName lastName email'),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: { orders, total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, carrier } = req.body;

    // Find old order to check for cancellation transition
    const oldOrder = await Order.findById(req.params.id).populate('items');
    if (!oldOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    // If order was not cancelled, but is now being set to cancelled, restore stock
    if (orderStatus === 'cancelled' && oldOrder.orderStatus !== 'cancelled') {
      if (oldOrder.items && oldOrder.items.length > 0) {
        for (const item of oldOrder.items) {
          const p = await Product.findById(item.product);
          if (p) {
            p.stockQuantity += item.quantity;
            if (item.size && p.sizes && p.sizes.length > 0) {
              const sizeIdx = p.sizes.findIndex(s => s.name === item.size || s === item.size);
              if (sizeIdx > -1 && typeof p.sizes[sizeIdx] === 'object' && p.sizes[sizeIdx].stock !== undefined) {
                p.sizes[sizeIdx].stock += item.quantity;
              }
            }
            await p.save();
          }
        }
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        ...(orderStatus && { orderStatus }), 
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNumber && { trackingNumber }), 
        ...(carrier && { carrier }) 
      },
      { new: true }
    ).populate('customer', 'firstName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If order is marked as delivered for the first time, award loyalty points
    if (orderStatus === 'delivered' && oldOrder.orderStatus !== 'delivered') {
      const pointsToAward = Math.floor(order.subtotal / 10);
      if (pointsToAward > 0) {
        await User.findByIdAndUpdate(order.customer._id, {
          $inc: { loyaltyPoints: pointsToAward }
        });
      }
    }

    await Notification.create({
      user: order.customer._id,
      title: `Order ${orderStatus.replace(/_/g, ' ').toUpperCase()}`,
      message: `Your order ${order.orderNumber} is now ${orderStatus.replace(/_/g, ' ')}.`,
      type: 'order',
      link: `/dashboard/orders/${order._id}`,
    });

    res.json({ success: true, message: 'Order status updated', data: { order } });
  } catch (err) { next(err); }
};

export const editOrder = async (req, res, next) => {
  try {
    const { shippingAddress, items } = req.body;
    const order = await Order.findById(req.params.id).populate('items');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be edited at this stage' });
    }

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    if (items && Array.isArray(items)) {
      let subtotal = 0;
      for (const reqItem of items) {
        const orderItem = await OrderItem.findById(reqItem._id);
        if (orderItem && orderItem.order.toString() === order._id.toString()) {
          // Adjust stock based on quantity difference
          const diff = reqItem.quantity - orderItem.quantity;
          if (diff !== 0) {
            const product = await Product.findById(orderItem.product);
            let availableStock = product.stockQuantity;
            let sizeIdx = -1;
            if (orderItem.size && product.sizes && product.sizes.length > 0) {
              sizeIdx = product.sizes.findIndex(s => s.name === orderItem.size || s === orderItem.size);
              if (sizeIdx > -1 && typeof product.sizes[sizeIdx] === 'object' && product.sizes[sizeIdx].stock !== undefined) {
                availableStock = product.sizes[sizeIdx].stock;
              }
            }

            if (product && availableStock >= diff) {
              product.stockQuantity -= diff;
              if (sizeIdx > -1 && typeof product.sizes[sizeIdx] === 'object') {
                product.sizes[sizeIdx].stock -= diff;
              }
              await product.save();
              orderItem.quantity = reqItem.quantity;
              await orderItem.save();
            } else if (diff > 0) {
              return res.status(400).json({ success: false, message: `Insufficient stock to increase quantity for ${orderItem.name}` });
            }
          }
        }
      }

      // Recalculate totals
      const updatedItems = await OrderItem.find({ order: order._id });
      subtotal = updatedItems.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0);
      
      let discount = 0;
      if (order.couponUsed) {
        const coupon = await Coupon.findOne({ code: order.couponUsed.toUpperCase() });
        if (coupon) {
          discount = coupon.discountType === 'flat' ? coupon.value : (subtotal * coupon.value) / 100;
          if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      }
      
      order.subtotal = subtotal;
      order.discount = discount;
      order.total = subtotal - discount + order.shippingCost + order.tax;
    }

    await order.save();
    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (err) { next(err); }
};
