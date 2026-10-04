import { User, Address } from '../models/UserSchema.js';
import { Notification } from '../models/MarketingSchema.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, mobileNumber } = req.body;
    if (mobileNumber) {
      const slMobileRegex = /^(?:\+94|94|0)?7[01245678]\d{7}$/;
      if (!slMobileRegex.test(mobileNumber)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567)' });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user._id, { firstName, lastName, mobileNumber }, { new: true }
    ).select('-password -refreshTokens');
    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, data: { addresses } });
  } catch (err) { next(err); }
};

export const addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: { address } });
  } catch (err) { next(err); }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, data: { address } });
  } catch (err) { next(err); }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) { next(err); }
};

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ success: true, data: { notifications } });
  } catch (err) { next(err); }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

export const getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints firstName');
    res.json({ success: true, data: { loyaltyPoints: user.loyaltyPoints } });
  } catch (err) { next(err); }
};
