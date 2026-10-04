import { Order } from '../models/OrderSchema.js';
import { User } from '../models/UserSchema.js';
import { Product } from '../models/ProductSchema.js';
import { Return, Refund } from '../models/OrderSchema.js';
import { Category, Collection } from '../models/ProductSchema.js';
import { NewsletterSubscriber, ContactMessage, Notification } from '../models/MarketingSchema.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders, totalCustomers, totalRevenue,
      dailyOrders, monthlyRevenue, lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({ orderStatus: { $nin: ['cancelled'] } }),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.find({ stockQuantity: { $lt: 10 }, status: 'active' }).select('name stockQuantity sku').limit(10),
      Order.find({ orderStatus: { $nin: ['cancelled'] } })
        .select('orderNumber orderStatus paymentStatus total createdAt')
        .sort('-createdAt')
        .limit(10)
        .populate('customer', 'firstName lastName'),
    ]);

    const bestSellers = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { 'product.name': 1, 'product.images': 1, totalSold: 1 } },
    ]);

    // Normalize recent orders to a consistent shape for the frontend
    const normalizedRecentOrders = recentOrders.map(o => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.orderStatus,
      paymentStatus: o.paymentStatus,
      totalAmount: o.total,
      createdAt: o.createdAt,
      customer: o.customer,
    }));

    res.json({
      success: true,
      data: {
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        dailyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        lowStockProducts,
        lowStockCount: lowStockProducts.length,
        bestSellers,
        recentOrders: normalizedRecentOrders,
      },
    });
  } catch (err) { next(err); }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const data = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]);

    const chart = months.map(m => {
      const found = data.find(d => d._id.year === m.year && d._id.month === m.month);
      return { month: `${m.year}-${String(m.month).padStart(2,'0')}`, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    res.json({ success: true, data: { chart } });
  } catch (err) { next(err); }
};

export const adminGetAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter = role ? { role } : { role: { $in: ['customer', 'admin'] } };
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -refreshTokens').sort('-createdAt').skip(skip).limit(+limit),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { users, total } });
  } catch (err) { next(err); }
};

export const adminToggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.lockUntil = user.lockUntil ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await user.save();
    res.json({ success: true, message: `User ${user.lockUntil ? 'blocked' : 'unblocked'}` });
  } catch (err) { next(err); }
};

export const adminManageReturns = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const returns = await Return.find(filter).populate('order customer').sort('-createdAt');
    res.json({ success: true, data: { returns } });
  } catch (err) { next(err); }
};

export const adminUpdateReturn = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Find old return state
    const oldReturn = await Return.findById(req.params.id);
    if (!oldReturn) return res.status(404).json({ success: false, message: 'Return not found' });
    
    const returnReq = await Return.findByIdAndUpdate(req.params.id, { status, adminNotes }, { new: true }).populate('order');
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });

    if (status === 'approved' && oldReturn.status !== 'approved') {
      // 1. Restock products
      for (const item of returnReq.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity }
        });
      }

      // 2. Deduct loyalty points (earned from this return portion)
      const returnSubtotal = returnReq.items.reduce((s, item) => s + (item.price * item.quantity), 0);
      const pointsToDeduct = Math.floor(returnSubtotal / 10);
      
      if (pointsToDeduct > 0) {
        await User.findByIdAndUpdate(returnReq.customer, {
          $inc: { loyaltyPoints: -pointsToDeduct }
        });
      }

      // 3. Mark order as returned if all returns are complete? Just mark it returned for now
      if (returnReq.order) {
        await Order.findByIdAndUpdate(returnReq.order._id, { orderStatus: 'returned' });
      }

      await Notification.create({
        user: returnReq.customer, title: 'Return Approved',
        message: 'Your return request has been approved. Refund will be processed shortly.',
        type: 'order',
      });
    } else if (status === 'rejected' && oldReturn.status !== 'rejected') {
      if (returnReq.order) {
        await Order.findByIdAndUpdate(returnReq.order._id, { orderStatus: 'delivered' });
      }
      await Notification.create({
        user: returnReq.customer, title: 'Return Rejected',
        message: 'Your return request has been rejected. Check admin notes for more details.',
        type: 'order',
      });
    }

    res.json({ success: true, data: { returnReq } });
  } catch (err) { next(err); }
};

export const adminGetCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
};

export const adminCreateCategory = async (req, res, next) => {
  try {
    const { generateSlug } = await import('../utils/helpers.js');
    const data = { ...req.body };
    if (!data.slug) data.slug = generateSlug(data.name);
    
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    }
    const category = await Category.create(data);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) { next(err); }
};

export const adminUpdateCategory = async (req, res, next) => {
  try {
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const data = { ...req.body };
    if (data.slug && data.slug !== existingCategory.slug) {
      const duplicate = await Category.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
      if (duplicate) {
        data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
      }
    } else {
      delete data.slug;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: { category } });
  } catch (err) { next(err); }
};

export const adminDeleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

export const adminGetNewsletterSubscribers = async (req, res, next) => {
  try {
    const subscribers = await NewsletterSubscriber.find({ status: 'active' }).sort('-createdAt');
    res.json({ success: true, data: { subscribers, total: subscribers.length } });
  } catch (err) { next(err); }
};

export const adminGetContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt');
    res.json({ success: true, data: { messages } });
  } catch (err) { next(err); }
};

export const adminUpdateContactMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { message: msg } });
  } catch (err) { next(err); }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    await NewsletterSubscriber.findOneAndUpdate({ email }, { email, status: 'active' }, { upsert: true, new: true });
    res.json({ success: true, message: 'Subscribed to newsletter successfully!' });
  } catch (err) { next(err); }
};

export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, message, subject } = req.body;

    // Save to database
    const msg = await ContactMessage.create(req.body);

    // Send notification email TO the store
    const storeEmail = process.env.EMAIL_FROM || 'vimsaclothing@gmail.com';
    const { sendEmail } = await import('../utils/emailService.js');

    await sendEmail(
      storeEmail,
      `📩 New Contact Message from ${name} — VIMSA`,
      `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:#000;padding:30px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;">VIMSA</h1>
          <p style="color:#888;font-size:12px;margin-top:8px;">NEW CUSTOMER ENQUIRY</p>
        </div>
        <div style="padding:40px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;width:120px;">FROM</td>
              <td style="padding:10px 0;color:#111;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;">EMAIL</td>
              <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#D4AF37;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;">SUBJECT</td>
              <td style="padding:10px 0;color:#111;">${subject || 'General Enquiry'}</td>
            </tr>
          </table>
          <div style="background:#f8f8f8;border-left:4px solid #D4AF37;padding:20px;margin-top:24px;border-radius:2px;">
            <p style="color:#111;line-height:1.8;margin:0;">${message}</p>
          </div>
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your VIMSA Enquiry')}"
             style="display:inline-block;background:#D4AF37;color:#000;padding:14px 28px;text-decoration:none;font-weight:700;margin-top:28px;border-radius:2px;letter-spacing:1px;">
            REPLY TO ${name.toUpperCase()}
          </a>
        </div>
        <div style="background:#f8f8f8;padding:20px;text-align:center;color:#999;font-size:12px;">
          Received: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })} (Sri Lanka Time)
        </div>
      </div>`
    );

    // Send confirmation email TO the customer
    await sendEmail(
      email,
      `We received your message — VIMSA Clothing`,
      `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:#000;padding:30px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;">VIMSA</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#111;font-family:Outfit,sans-serif;">Thank you, ${name}!</h2>
          <p style="color:#666;line-height:1.8;">We have received your message and will get back to you within 24 hours.</p>
          <div style="background:#f8f8f8;border-left:4px solid #D4AF37;padding:20px;margin:24px 0;">
            <p style="color:#888;font-size:12px;margin:0 0 8px;">YOUR MESSAGE</p>
            <p style="color:#111;line-height:1.8;margin:0;">${message}</p>
          </div>
          <p style="color:#666;font-size:13px;">For urgent enquiries, contact us directly at <a href="mailto:vimsaclothing@gmail.com" style="color:#D4AF37;">vimsaclothing@gmail.com</a> or call <strong>+94 77 123 4567</strong>.</p>
        </div>
        <div style="background:#f8f8f8;padding:20px;text-align:center;color:#999;font-size:12px;">
          © ${new Date().getFullYear()} VIMSA Clothing. Bogawanthalawa, Sri Lanka.
        </div>
      </div>`
    );

    res.status(201).json({ success: true, message: 'Message sent! We will respond within 24 hours.', data: { message: msg } });
  } catch (err) { next(err); }
};


export const createReturn = async (req, res, next) => {
  try {
    const { order: orderId, items, reason, images } = req.body;
    
    // Find order
    const order = await Order.findOne({ _id: orderId, customer: req.user._id }).populate('items');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Check if order is delivered
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });
    }
    
    // Check if a return already exists for this order
    const existingReturn = await Return.findOne({ order: orderId, status: { $in: ['pending', 'approved'] } });
    if (existingReturn) {
      return res.status(400).json({ success: false, message: 'A return request already exists for this order.' });
    }

    // Validate items
    const returnItems = [];
    for (const returnItem of items) {
      const orderItem = order.items.find(i => i.product.toString() === returnItem.product);
      if (!orderItem) {
        return res.status(400).json({ success: false, message: 'Item not found in order' });
      }
      if (returnItem.quantity > orderItem.quantity) {
        return res.status(400).json({ success: false, message: 'Return quantity exceeds order quantity' });
      }
      returnItems.push({
        product: returnItem.product,
        quantity: returnItem.quantity,
        price: orderItem.salePrice || orderItem.price
      });
    }

    const returnReq = await Return.create({ 
      order: orderId,
      customer: req.user._id,
      items: returnItems,
      reason,
      images
    });

    // Update order status to return_requested
    order.orderStatus = 'return_requested';
    await order.save();

    res.status(201).json({ success: true, message: 'Return request submitted', data: { return: returnReq } });
  } catch (err) { next(err); }
};

export const getMyReturns = async (req, res, next) => {
  try {
    const returns = await Return.find({ customer: req.user._id }).populate('order').sort('-createdAt');
    res.json({ success: true, data: { returns } });
  } catch (err) { next(err); }
};

export const adminGetCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find().sort('name');
    res.json({ success: true, data: { collections } });
  } catch (err) { next(err); }
};

export const adminCreateCollection = async (req, res, next) => {
  try {
    const { generateSlug } = await import('../utils/helpers.js');
    const data = { ...req.body };
    if (!data.slug) data.slug = generateSlug(data.name);
    const collection = await Collection.create(data);
    res.status(201).json({ success: true, data: { collection } });
  } catch (err) { next(err); }
};

export const adminUpdateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { collection } });
  } catch (err) { next(err); }
};

export const adminDeleteCollection = async (req, res, next) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) { next(err); }
};

