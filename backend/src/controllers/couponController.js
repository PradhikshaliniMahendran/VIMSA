import { Coupon } from '../models/MarketingSchema.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiryDate < Date.now()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (coupon.usageCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (coupon.usersUsed.includes(req.user._id)) return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is LKR ${coupon.minOrderAmount}` });

    let discountAmount = coupon.discountType === 'flat' ? coupon.value : (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);

    res.json({ success: true, data: { coupon: { code: coupon.code, discountType: coupon.discountType, value: coupon.value, discountAmount } } });
  } catch (err) { next(err); }
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: { coupon } });
  } catch (err) { next(err); }
};

export const adminGetAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: { coupons } });
  } catch (err) { next(err); }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};
