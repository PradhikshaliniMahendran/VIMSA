import { Settings } from '../models/SettingsSchema.js';

// Helper to get or create the singleton settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get global settings
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update global settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Update allowed fields
    const { 
      storeName,
      whatsappNumber,
      contactNumber,
      email,
      address,
      facebookUrl,
      instagramUrl,
      whatsappUrl,
      shippingFee, 
      freeShippingThreshold, 
      flashSaleActive, 
      flashSaleEndDate, 
      flashSaleTitle, 
      flashSaleDiscountText 
    } = req.body;

    if (storeName !== undefined) settings.storeName = storeName;
    if (whatsappNumber !== undefined) {
      settings.whatsappNumber = whatsappNumber;
      const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
      settings.whatsappUrl = `https://wa.me/${cleanNum}`;
      // If contactNumber is not provided or still set to old placeholder, sync with whatsappNumber
      if (!contactNumber || contactNumber.trim() === '' || contactNumber === '+94771234567' || contactNumber === '+94 77 123 4567') {
        settings.contactNumber = whatsappNumber;
      }
    }
    if (contactNumber !== undefined && contactNumber.trim() !== '') {
      settings.contactNumber = contactNumber;
    }
    if (email !== undefined) settings.email = email;
    if (address !== undefined) settings.address = address;
    if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
    if (whatsappUrl !== undefined && !whatsappNumber) settings.whatsappUrl = whatsappUrl;
    if (shippingFee !== undefined && !isNaN(Number(shippingFee))) settings.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined && !isNaN(Number(freeShippingThreshold))) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (flashSaleActive !== undefined) settings.flashSaleActive = Boolean(flashSaleActive);
    if (flashSaleEndDate !== undefined) settings.flashSaleEndDate = flashSaleEndDate ? new Date(flashSaleEndDate) : null;
    if (flashSaleTitle !== undefined) settings.flashSaleTitle = flashSaleTitle;
    if (flashSaleDiscountText !== undefined) settings.flashSaleDiscountText = flashSaleDiscountText;

    await settings.save();
    
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (err) {
    next(err);
  }
};
