import { v4 as uuidv4 } from 'uuid';

export const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIMSA-${year}-${rand}`;
};

export const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateReferralCode = () =>
  'VIM' + Math.random().toString(36).substring(2, 8).toUpperCase();

export const generateSKU = (categoryName = 'GEN') => {
  const prefix = categoryName.substring(0, 3).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${rand}`;
};
