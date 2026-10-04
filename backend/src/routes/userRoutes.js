import express from 'express';
import { updateProfile, changePassword, getMyAddresses, addAddress, updateAddress, deleteAddress, getMyNotifications, markNotificationRead, getLoyaltyPoints } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/addresses', getMyAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.get('/notifications', getMyNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/loyalty-points', getLoyaltyPoints);

export default router;
