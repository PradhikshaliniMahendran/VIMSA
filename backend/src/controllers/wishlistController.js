import { Wishlist } from '../models/MarketingSchema.js';

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json({ success: true, data: { wishlist: wishlist || { products: [] } } });
  } catch (err) { next(err); }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    if (!wishlist.products.includes(productId)) wishlist.products.push(productId);
    await wishlist.save();
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) { next(err); }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { $pull: { products: req.params.productId } });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
};
