import { Product } from '../models/ProductSchema.js';
import { generateSlug, generateSKU } from '../utils/helpers.js';
import { triggerAITryOn, checkAITryOnStatus } from '../utils/aiService.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      category, brand, collection, color, size, minPrice, maxPrice,
      isFeatured, isTrending, isBestSeller, isNewArrival,
      status, search, sort = '-createdAt', page = 1, limit = 12, productType
    } = req.query;

    const filter = {};
    if (productType) {
      if (productType.toUpperCase() === 'DRESS') {
        filter.productType = { $in: ['DRESS', 'clothing'] };
      } else if (productType.toUpperCase() === 'PLASTIC') {
        filter.productType = { $in: ['PLASTIC', 'general'] };
      } else {
        filter.productType = productType;
      }
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (collection) filter.collectionRef = collection;
    if (color) filter.colors = { $in: [color] };
    if (size) filter.sizes = { $in: [size] };
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isTrending === 'true') filter.isTrending = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'archived' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category brand collectionRef').sort(sort).skip(skip).limit(+limit),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, data: { products, total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// Admin-only: fetch ALL products across all statuses (no status filter, no archived)
export const adminGetAllProducts = async (req, res, next) => {
  try {
    const { search, sort = '-createdAt', page = 1, limit = 200, productType } = req.query;
    const filter = { status: { $ne: 'archived' } }; // show everything except deleted
    if (productType) {
      if (productType.toUpperCase() === 'DRESS') {
        filter.productType = { $in: ['DRESS', 'clothing'] };
      } else if (productType.toUpperCase() === 'PLASTIC') {
        filter.productType = { $in: ['PLASTIC', 'general'] };
      } else {
        filter.productType = productType;
      }
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category brand').sort(sort).skip(skip).limit(+limit),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: { products, total } });
  } catch (err) { next(err); }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: { $ne: 'archived' } })
      .populate('category brand collectionRef');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.slug) data.slug = generateSlug(data.name);
    if (!data.sku) data.sku = generateSKU(data.subcategory || 'GEN');

    const existing = await Product.findOne({ $or: [{ slug: data.slug }, { sku: data.sku }] });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
      data.sku = `${data.sku}-${Date.now()}`;
    }
    const product = await Product.create(data);

    // AI Try-On generation removed as per user request
    /*
    try {
      const CategoryModel = (await import('../models/ProductSchema.js')).Category;
      const categoryObj = await CategoryModel.findById(product.category);
      const categoryName = categoryObj ? categoryObj.name : '';
      await triggerAITryOn(product._id, categoryName);
    } catch (aiErr) {
      console.error('[AI Try-On] Initial trigger failed during creation:', aiErr.message);
    }
    */

    res.status(201).json({ success: true, message: 'Product created', data: { product } });
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const data = { ...req.body };

    if (data.slug && data.slug !== existing.slug) {
      const dupSlug = await Product.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
      if (dupSlug) data.slug = `${data.slug}-${Date.now()}`;
    } else {
      delete data.slug;
    }

    if (data.sku && data.sku !== existing.sku) {
      const dupSku = await Product.findOne({ sku: data.sku, _id: { $ne: req.params.id } });
      if (dupSku) data.sku = `${data.sku}-${Date.now()}`;
    } else {
      delete data.sku;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, message: 'Product updated', data: { product } });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product archived successfully' });
  } catch (err) { next(err); }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const filter = { isFeatured: true, status: { $ne: 'archived' } };
    if (req.query.productType) filter.productType = req.query.productType;
    const products = await Product.find(filter).limit(8).populate('category brand');
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

export const getTrendingProducts = async (req, res, next) => {
  try {
    const filter = { isTrending: true, status: { $ne: 'archived' } };
    if (req.query.productType) filter.productType = req.query.productType;
    const products = await Product.find(filter).limit(8).populate('category brand');
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

export const getBestSellers = async (req, res, next) => {
  try {
    const filter = { isBestSeller: true, status: { $ne: 'archived' } };
    if (req.query.productType) filter.productType = req.query.productType;
    const products = await Product.find(filter).limit(8).populate('category brand');
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const filter = { isNewArrival: true, status: { $ne: 'archived' } };
    if (req.query.productType) filter.productType = req.query.productType;
    const products = await Product.find(filter).sort('-createdAt').limit(8).populate('category brand');
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

export const getFlashSaleProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ salePrice: { $exists: true, $gt: 0 }, status: { $ne: 'archived' } }).limit(12).populate('category brand');
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
};

export const getAIStatus = async (req, res, next) => {
  try {
    const result = await checkAITryOnStatus(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

export const retriggerAI = async (req, res, next) => {
  try {
    const CategoryModel = (await import('../models/ProductSchema.js')).Category;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const categoryObj = await CategoryModel.findById(product.category);
    const categoryName = categoryObj ? categoryObj.name : '';

    const result = await triggerAITryOn(product._id, categoryName);
    res.json(result);
  } catch (err) { next(err); }
};
