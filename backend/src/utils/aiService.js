import axios from 'axios';
import { Product } from '../models/ProductSchema.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// ─── fal.ai Queue endpoints (avoids Vercel 10s timeout) ──────────────────────
// Submit job  → POST  https://queue.fal.run/fashn/tryon/v1.6
// Poll status → GET   https://queue.fal.run/fashn/tryon/v1.6/requests/{id}/status
// Get result  → GET   https://queue.fal.run/fashn/tryon/v1.6/requests/{id}
const FAL_QUEUE_SUBMIT = 'https://queue.fal.run/fashn/tryon/v1.6';
const FAL_QUEUE_STATUS = (id) => `https://queue.fal.run/fashn/tryon/v1.6/requests/${id}/status`;
const FAL_QUEUE_RESULT = (id) => `https://queue.fal.run/fashn/tryon/v1.6/requests/${id}`;

// ─── FASHN AI direct endpoints (fallback) ────────────────────────────────────
const FASHN_API_URL = 'https://api.fashn.ai/v1';

// ─── Base model photos — plain neutral background, full body, fashion pose ───
// These posed model photos give FASHN/fal.ai the best try-on quality
const BASE_MODELS = {
  female: {
    front: 'https://images.unsplash.com/photo-1618568949025-01c3cf4ba836?q=90&w=768&fit=crop',
    back:  'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?q=90&w=768&fit=crop',
    side:  'https://images.unsplash.com/photo-1593173930865-a36b6d5af02e?q=90&w=768&fit=crop',
  },
  male: {
    front: 'https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?q=90&w=768&fit=crop',
    back:  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=90&w=768&fit=crop',
    side:  'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?q=90&w=768&fit=crop',
  },
};

// ─── Demo-mode placeholder images (when no API key is set) ───────────────────
const SIMULATED_OUTPUTS = {
  female: {
    front: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    back:  'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=800',
    side:  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
  },
  male: {
    front: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800',
    back:  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800',
    side:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800',
  },
};

// ─── Detect which provider is configured ─────────────────────────────────────
const getProvider = () => {
  const falKey  = process.env.FAL_API_KEY;
  const fashnKey = process.env.FASHN_API_KEY;
  if (falKey  && falKey  !== 'mock' && falKey  !== '') return 'fal';
  if (fashnKey && fashnKey !== 'mock' && fashnKey !== '') return 'fashn';
  return 'mock';
};

// ─── Gender detection ─────────────────────────────────────────────────────────
export const getModelGender = (productName, categoryName) => {
  const cat  = (categoryName || '').toLowerCase();
  const name = (productName  || '').toLowerCase();
  if (['men', 'male', 'boy', 'gent'].some(k => cat.includes(k) || name.includes(k))) return 'male';
  return 'female';
};

// ─── FASHN / fal.ai category mapping ─────────────────────────────────────────
export const getFashnCategory = (productName, categoryName) => {
  const cat  = (categoryName || '').toLowerCase();
  const name = (productName  || '').toLowerCase();
  const combined = `${cat} ${name}`;
  if (['dress', 'frock', 'skirt', 'gown', 'jumpsuit', 'one-piece', 'romper', 'saree'].some(k => combined.includes(k))) return 'one-pieces';
  if (['cargo', 'pant', 'trouser', 'short', 'legging', 'jeans', 'denim', 'bottom'].some(k => combined.includes(k))) return 'bottoms';
  return 'tops';
};

// ─── Cloudinary uploader (passthrough if not configured) ─────────────────────
const uploadImageUrl = async (url) => {
  const isMock = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud_name';
  if (isMock) return url;
  try {
    const result = await uploadToCloudinary(url, 'vimsa-ai-models');
    return result.url;
  } catch (err) {
    console.error('[AI Try-On] Cloudinary upload failed:', err.message);
    return url;
  }
};

// ─── fal.ai: Submit job to queue (returns request_id instantly) ───────────────
const submitFalJob = async (modelImage, garmentImage, category) => {
  const res = await axios.post(
    FAL_QUEUE_SUBMIT,
    {
      model_image:        modelImage,
      garment_image:      garmentImage,
      category:           category,
      mode:               'quality',         // quality | balanced | performance
      garment_photo_type: 'flat-lay',        // flat-lay | model | auto
      restore_background: true,
      restore_clothes:    true,
      long_top:           false,
    },
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
      },
      timeout: 15000, // 15s for submission only — fast
    }
  );
  // Queue response: { request_id, status, response_url, status_url }
  const requestId = res.data?.request_id;
  if (!requestId) throw new Error(`fal.ai queue submission failed: ${JSON.stringify(res.data)}`);
  return requestId;
};

// ─── fal.ai: Poll status of a queued job ─────────────────────────────────────
const checkFalJobStatus = async (requestId) => {
  const res = await axios.get(FAL_QUEUE_STATUS(requestId), {
    headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` },
    timeout: 10000,
  });
  // { status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED', ... }
  return res.data;
};

// ─── fal.ai: Fetch final result once status is COMPLETED ─────────────────────
const getFalJobResult = async (requestId) => {
  const res = await axios.get(FAL_QUEUE_RESULT(requestId), {
    headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` },
    timeout: 10000,
  });
  // { images: [{ url, content_type, width, height }], ... }
  const url = res.data?.images?.[0]?.url;
  if (!url) throw new Error(`fal.ai result missing image URL for request ${requestId}`);
  return url;
};

// ─── FASHN AI: Submit async job ───────────────────────────────────────────────
const submitFashnJob = async (modelImage, garmentImage, category) => {
  const res = await axios.post(
    `${FASHN_API_URL}/run`,
    { model_name: 'tryon-v1.6', inputs: { model_image: modelImage, garment_image: garmentImage, category } },
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` }, timeout: 15000 }
  );
  return res.data?.id || res.data?.prediction_id;
};

// ─── FASHN AI: Poll job status ────────────────────────────────────────────────
const checkFashnJobStatus = async (id) => {
  const res = await axios.get(`${FASHN_API_URL}/status/${id}`, {
    headers: { 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
    timeout: 10000,
  });
  return res.data; // { status: 'completed'|'failed'|'processing', output, error }
};

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTED: Trigger AI try-on — submits jobs and returns immediately (<5s)
// Called when admin creates a product
// ═════════════════════════════════════════════════════════════════════════════
export const triggerAITryOn = async (productId, categoryName) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return { error: 'Product not found' };

    const gender   = getModelGender(product.name, categoryName);
    const category = getFashnCategory(product.name, categoryName);
    const garment  = product.images?.[0];

    if (!garment) {
      product.aiGenerationStatus = 'none';
      await product.save();
      return { message: 'No garment image found. Upload a product image to enable AI try-on.' };
    }

    const provider = getProvider();
    console.log(`[AI Try-On] Provider="${provider}" | Product="${product.name}" | Gender="${gender}" | Category="${category}"`);

    // ── Demo / mock mode ──────────────────────────────────────────────────────
    if (provider === 'mock') {
      console.log('[AI Try-On] No API key found — running in demo/mock mode');
      product.aiPredictionIds    = { front: `mock_${Date.now()}`, back: `mock_b_${Date.now()}`, side: `mock_s_${Date.now()}` };
      product.aiGenerationStatus = 'pending';
      await product.save();
      return { success: true, isMock: true, message: 'Demo mode active. Add FAL_API_KEY to .env to enable real AI try-on.' };
    }

    const models = BASE_MODELS[gender];

    // ── fal.ai queue (submit 3 jobs in parallel, all done in <5s) ────────────
    if (provider === 'fal') {
      const [frontId, backId, sideId] = await Promise.all([
        submitFalJob(models.front, garment, category),
        submitFalJob(models.back,  garment, category),
        submitFalJob(models.side,  garment, category),
      ]);
      product.aiPredictionIds    = { front: `fal:${frontId}`, back: `fal:${backId}`, side: `fal:${sideId}` };
      product.aiGenerationStatus = 'pending';
      product.aiGenerationError  = undefined;
      await product.save();
      console.log(`[AI Try-On] fal.ai jobs queued: front=${frontId} back=${backId} side=${sideId}`);
      return { success: true, provider: 'fal', status: 'pending' };
    }

    // ── FASHN AI async (submit 3 jobs in parallel) ────────────────────────────
    if (provider === 'fashn') {
      const [frontId, backId, sideId] = await Promise.all([
        submitFashnJob(models.front, garment, category),
        submitFashnJob(models.back,  garment, category),
        submitFashnJob(models.side,  garment, category),
      ]);
      product.aiPredictionIds    = { front: frontId, back: backId, side: sideId };
      product.aiGenerationStatus = 'pending';
      product.aiGenerationError  = undefined;
      await product.save();
      console.log(`[AI Try-On] FASHN jobs queued: front=${frontId} back=${backId} side=${sideId}`);
      return { success: true, provider: 'fashn', status: 'pending' };
    }

  } catch (err) {
    console.error('[AI Try-On] triggerAITryOn provider failed. Falling back to mock mode. Error:', err.message);
    const product = await Product.findById(productId).catch(() => null);
    if (product) {
      console.log('[AI Try-On] Activating fallback mock mode due to API failure.');
      product.aiPredictionIds    = { front: `mock_${Date.now()}`, back: `mock_b_${Date.now()}`, side: `mock_s_${Date.now()}` };
      product.aiGenerationStatus = 'pending';
      product.aiGenerationError  = undefined;
      await product.save();
    }
    return { success: true, isMock: true, message: 'Fell back to Demo mode due to AI provider error.' };
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTED: Poll AI status — called by frontend every few seconds
// Completes generation when all 3 jobs are done
// ═════════════════════════════════════════════════════════════════════════════
export const checkAITryOnStatus = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: 'Product not found' };

    // Already resolved — return immediately
    if (product.aiGenerationStatus !== 'pending') {
      return { success: true, status: product.aiGenerationStatus, product };
    }

    const { front, back, side } = product.aiPredictionIds || {};
    if (!front || !back || !side) {
      product.aiGenerationStatus = 'failed';
      product.aiGenerationError  = 'Missing prediction IDs';
      await product.save();
      return { success: false, status: 'failed', message: 'Missing prediction IDs' };
    }

    // ── Mock / demo mode: resolve after 4 seconds with placeholder images ─────
    if (front.startsWith('mock_')) {
      const elapsed = Date.now() - product.updatedAt.getTime();
      if (elapsed < 5000) return { success: true, status: 'pending', message: 'Generating AI model...' };

      const gender    = getModelGender(product.name, '');
      const simulated = SIMULATED_OUTPUTS[gender];
      const [fUrl, bUrl, sUrl] = await Promise.all([
        uploadImageUrl(simulated.front),
        uploadImageUrl(simulated.back),
        uploadImageUrl(simulated.side),
      ]);
      const original = product.images?.[0];
      if (original && !product.gallery?.includes(original)) product.gallery.push(original);
      product.images             = [fUrl, bUrl, sUrl];
      product.aiGenerationStatus = 'completed';
      await product.save();
      return { success: true, status: 'completed', product };
    }

    // ── fal.ai queue polling ──────────────────────────────────────────────────
    if (front.startsWith('fal:')) {
      const frontId = front.replace('fal:', '');
      const backId  = back.replace('fal:', '');
      const sideId  = side.replace('fal:', '');

      const [fStatus, bStatus, sStatus] = await Promise.all([
        checkFalJobStatus(frontId),
        checkFalJobStatus(backId),
        checkFalJobStatus(sideId),
      ]);

      // Check for failures
      const failed = [fStatus, bStatus, sStatus].find(s => s.status === 'FAILED');
      if (failed) {
        product.aiGenerationStatus = 'failed';
        product.aiGenerationError  = failed.error || 'fal.ai generation failed';
        await product.save();
        return { success: false, status: 'failed', message: product.aiGenerationError };
      }

      // Still processing
      if ([fStatus, bStatus, sStatus].some(s => ['IN_QUEUE', 'IN_PROGRESS'].includes(s.status))) {
        const statuses = [fStatus.status, bStatus.status, sStatus.status].join(' / ');
        return { success: true, status: 'pending', message: `AI model generating... (${statuses})` };
      }

      // All completed — fetch result URLs
      if ([fStatus, bStatus, sStatus].every(s => s.status === 'COMPLETED')) {
        const [fUrl, bUrl, sUrl] = await Promise.all([
          getFalJobResult(frontId),
          getFalJobResult(backId),
          getFalJobResult(sideId),
        ]);

        // Upload to Cloudinary for permanent storage
        const [fCloud, bCloud, sCloud] = await Promise.all([
          uploadImageUrl(fUrl),
          uploadImageUrl(bUrl),
          uploadImageUrl(sUrl),
        ]);

        const original = product.images?.[0];
        if (original && !product.gallery?.includes(original)) product.gallery.push(original);
        product.images             = [fCloud, bCloud, sCloud];
        product.aiGenerationStatus = 'completed';
        product.aiGenerationError  = undefined;
        await product.save();

        console.log(`[AI Try-On] ✅ fal.ai completed for product ${product._id}`);
        return { success: true, status: 'completed', product };
      }

      return { success: true, status: 'pending', message: 'Waiting for fal.ai...' };
    }

    // ── FASHN AI polling ──────────────────────────────────────────────────────
    const [fStatus, bStatus, sStatus] = await Promise.all([
      checkFashnJobStatus(front),
      checkFashnJobStatus(back),
      checkFashnJobStatus(side),
    ]);

    if ([fStatus, bStatus, sStatus].some(s => s.status === 'failed')) {
      const errMsg = `F:${fStatus.error||'ok'} B:${bStatus.error||'ok'} S:${sStatus.error||'ok'}`;
      product.aiGenerationStatus = 'failed';
      product.aiGenerationError  = errMsg;
      await product.save();
      return { success: false, status: 'failed', message: errMsg };
    }

    if ([fStatus, bStatus, sStatus].every(s => s.status === 'completed')) {
      const fOut = fStatus.output?.[0] || fStatus.output;
      const bOut = bStatus.output?.[0] || bStatus.output;
      const sOut = sStatus.output?.[0] || sStatus.output;
      if (!fOut || !bOut || !sOut) throw new Error('FASHN output URLs missing');

      const [fCloud, bCloud, sCloud] = await Promise.all([
        uploadImageUrl(fOut), uploadImageUrl(bOut), uploadImageUrl(sOut),
      ]);
      const original = product.images?.[0];
      if (original && !product.gallery?.includes(original)) product.gallery.push(original);
      product.images             = [fCloud, bCloud, sCloud];
      product.aiGenerationStatus = 'completed';
      product.aiGenerationError  = undefined;
      await product.save();
      return { success: true, status: 'completed', product };
    }

    return { success: true, status: 'pending', message: 'FASHN AI processing...' };

  } catch (err) {
    console.error('[AI Try-On] checkAITryOnStatus error:', err.message);
    const product = await Product.findById(productId).catch(() => null);
    if (product) {
      product.aiGenerationStatus = 'failed';
      product.aiGenerationError  = err.response?.data?.message || err.message;
      await product.save();
    }
    return { success: false, status: 'failed', error: err.message };
  }
};
