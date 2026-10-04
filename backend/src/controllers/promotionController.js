import { Promotion } from '../models/MarketingSchema.js';

// Public: Get currently active featured promotion for popup
export const getActivePromotion = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find active promotion matching dates
    let promotion = await Promotion.findOne({
      status: 'active',
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null },
        { startDate: { $exists: false } }
      ]
    }).sort('-isFeatured -createdAt');

    // Fallback: If no date matched, find any active promotion
    if (!promotion) {
      promotion = await Promotion.findOne({ status: 'active' }).sort('-isFeatured -createdAt');
    }

    if (!promotion) {
      return res.json({ success: true, data: { promotion: null } });
    }

    res.json({ success: true, data: { promotion } });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all promotions
export const adminGetPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort('-createdAt');
    res.json({ success: true, data: { promotions } });
  } catch (err) {
    next(err);
  }
};

// Admin: Create promotion
export const adminCreatePromotion = async (req, res, next) => {
  try {
    const { title, description, discountText, bannerImage, ctaText, ctaLink, startDate, endDate, status, isFeatured } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, start date, and end date are required.' });
    }

    let start = new Date(startDate);
    let end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date must be after the start date.' });
    }

    // If marked featured, un-feature others to ensure single primary featured offer
    if (isFeatured) {
      await Promotion.updateMany({}, { isFeatured: false });
    }

    const promotion = await Promotion.create({
      title,
      description,
      discountText,
      bannerImage,
      ctaText: ctaText || 'Shop Now',
      ctaLink: ctaLink || '/shop?type=DRESS',
      startDate: start,
      endDate: end,
      status: status || 'active',
      isFeatured: !!isFeatured
    });

    res.status(201).json({ success: true, data: { promotion }, message: 'Promotion created successfully.' });
  } catch (err) {
    next(err);
  }
};

// Admin: Update promotion
export const adminUpdatePromotion = async (req, res, next) => {
  try {
    const { startDate, endDate, isFeatured } = req.body;

    if (startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (end < start) {
        return res.status(400).json({ success: false, message: 'End date must be after the start date.' });
      }
      req.body.startDate = start;
      req.body.endDate = end;
    }

    if (isFeatured) {
      await Promotion.updateMany({ _id: { $ne: req.params.id } }, { isFeatured: false });
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    res.json({ success: true, data: { promotion }, message: 'Promotion updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete promotion
export const adminDeletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    res.json({ success: true, message: 'Promotion deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
