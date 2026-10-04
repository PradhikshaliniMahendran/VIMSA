import { Review } from '../models/MarketingSchema.js';
import { Product } from '../models/ProductSchema.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'firstName lastName').sort('-createdAt');
    res.json({ success: true, data: { reviews } });
  } catch (err) { next(err); }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    const review = await Review.create({ product: productId, user: req.user._id, rating, comment, images });

    // Update product rating
    const reviews = await Review.find({ product: productId, status: 'approved' });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { ratings: avg.toFixed(1), numReviews: reviews.length });

    res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
  } catch (err) { next(err); }
};

export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

export const getRecentReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'approved', rating: { $gte: 4 } })
      .populate('user', 'firstName lastName')
      .sort('-createdAt')
      .limit(6);
    res.json({ success: true, data: { reviews } });
  } catch (err) { next(err); }
};
