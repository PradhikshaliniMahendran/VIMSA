import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', requireAdmin, updateSettings);

export default router;
