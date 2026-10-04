import { Cart } from '../models/MarketingSchema.js';
import { Product } from '../models/ProductSchema.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ success: true, data: { cart: cart || { user: req.user._id, items: [] } } });
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    let availableStock = product.stockQuantity;
    let itemPrice = product.salePrice || product.price;

    if (size && product.sizes && product.sizes.length > 0) {
      const sizeObj = product.sizes.find(s => s.name === size || s === size);
      if (sizeObj && typeof sizeObj === 'object') {
        if (sizeObj.stock !== undefined) availableStock = sizeObj.stock;
        if (sizeObj.price) itemPrice = sizeObj.price;
      }
    }

    // Allow adding out-of-stock items to cart for later use

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId && i.size === size && i.color === color);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color, price: itemPrice });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, message: 'Added to cart', data: { cart } });
  } catch (err) { next(err); }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    if (quantity <= 0) { item.deleteOne(); }
    else { item.quantity = quantity; }

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    res.json({ success: true, message: 'Item removed from cart', data: { cart } });
  } catch (err) { next(err); }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
