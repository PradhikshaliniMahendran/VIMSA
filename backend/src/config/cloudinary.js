import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = 'vimsa') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    quality: 'auto',
    fetch_format: 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
