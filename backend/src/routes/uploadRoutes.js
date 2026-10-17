import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Always use memory storage — never write to disk (Vercel read-only filesystem)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

/**
 * Returns true if real Cloudinary credentials are configured.
 */
const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME: n, CLOUDINARY_API_KEY: k, CLOUDINARY_API_SECRET: s } = process.env;
  return n && n !== 'mock_cloud_name' && k && k !== 'mock_api_key' && s && s !== 'mock_api_secret';
};

/**
 * Stream a buffer directly to Cloudinary (no disk write).
 */
const uploadToCloudinary = (buffer, folder = 'vimsa') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, quality: 'auto', fetch_format: 'auto' },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(buffer);
  });
};

const bufferToDataUrl = (buffer, mimetype = 'image/jpeg') => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

/**
 * Upload to catbox.moe (free, permanent public URLs).
 * Automatically falls back to Base64 Data URL if blocked or timed out.
 */
const uploadToImgBB = async (buffer, mimetype = 'image/jpeg') => {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', new Blob([buffer]), 'image.jpg');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error('catbox.moe failed: ' + res.statusText);
    const url = await res.text();
    if (!url.startsWith('http')) throw new Error('catbox.moe invalid response');
    return url;
  } catch (err) {
    console.warn('[Upload fallback] External host unavailable, using Data URL fallback:', err.message);
    return bufferToDataUrl(buffer, mimetype);
  }
};

// ─── POST /api/v1/upload/single ───────────────────────────────────────────────
router.post('/single', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'vimsa');
        return res.json({ success: true, message: 'Uploaded to Cloudinary', data: { url: result.secure_url, publicId: result.public_id } });
      } catch (cloudErr) {
        console.warn('[Upload Cloudinary failed, trying fallback]:', cloudErr.message);
      }
    }

    const url = await uploadToImgBB(req.file.buffer, req.file.mimetype);
    return res.json({ success: true, message: 'Uploaded successfully', data: { url, publicId: `img_${Date.now()}` } });

  } catch (error) {
    console.error('[Upload] /single error:', error.message);
    if (req.file) {
      const url = bufferToDataUrl(req.file.buffer, req.file.mimetype);
      return res.json({ success: true, message: 'Image processed as Data URL', data: { url, publicId: `data_${Date.now()}` } });
    }
    next(error);
  }
});

// ─── POST /api/v1/upload/multiple ─────────────────────────────────────────────
router.post('/multiple', requireAdmin, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });

    if (isCloudinaryConfigured()) {
      try {
        const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'vimsa')));
        return res.json({ success: true, message: 'Uploaded to Cloudinary', data: results.map(r => ({ url: r.secure_url, publicId: r.public_id })) });
      } catch (cloudErr) {
        console.warn('[Upload Cloudinary multiple failed, trying fallback]:', cloudErr.message);
      }
    }

    // Fallback: catbox with Data URL backup
    const urls = await Promise.all(req.files.map(f => uploadToImgBB(f.buffer, f.mimetype)));
    return res.json({ success: true, message: 'Images uploaded successfully', data: urls.map((url, i) => ({ url, publicId: `img_${Date.now()}_${i}` })) });

  } catch (error) {
    console.error('[Upload] /multiple error:', error.message);
    if (req.files && req.files.length > 0) {
      const urls = req.files.map(f => bufferToDataUrl(f.buffer, f.mimetype));
      return res.json({ success: true, message: 'Images processed as Data URLs', data: urls.map((url, i) => ({ url, publicId: `data_${Date.now()}_${i}` })) });
    }
    next(error);
  }
});

// ─── POST /api/v1/upload/user-upload ──────────────────────────────────────────
router.post('/user-upload', requireAuth, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });

    if (isCloudinaryConfigured()) {
      const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'vimsa_reviews')));
      return res.json({ success: true, message: 'Uploaded to Cloudinary', data: results.map(r => ({ url: r.secure_url, publicId: r.public_id })) });
    }

    // Fallback: ImgBB
    const urls = await Promise.all(req.files.map(f => uploadToImgBB(f.buffer)));
    return res.json({ success: true, message: 'Uploaded to ImgBB', data: urls.map((url, i) => ({ url, publicId: `imgbb_${Date.now()}_${i}` })) });

  } catch (error) {
    console.error('[Upload] /user-upload error:', error.message);
    next(error);
  }
});

export default router;
