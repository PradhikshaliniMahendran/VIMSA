import express from 'express';
import { register, login, logout, verifyOTP, forgotPassword, resetPassword, refreshToken, getMe, resendOTP, registerWithFirebase, validateEmailAddress } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/UserSchema.js';

const router = express.Router();

router.post('/validate-email', validateEmailAddress);
router.post('/register', register);
router.post('/register-with-firebase', registerWithFirebase);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.get('/me', requireAuth, getMe);

// Emergency admin unlock route (secret key protected)
router.post('/emergency-unlock', async (req, res) => {
  try {
    const { secretKey } = req.body;
    if (secretKey !== 'VIMSA_UNLOCK_2026') {
      return res.status(403).json({ success: false, message: 'Invalid secret key' });
    }
    const result = await User.updateMany(
      { role: { $in: ['admin', 'superadmin'] } },
      { $set: { failedLoginAttempts: 0, lockUntil: null, isVerified: true } }
    );
    res.json({ success: true, message: `Unlocked ${result.modifiedCount} admin account(s)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Emergency admin password reset (secret key protected)
router.post('/emergency-reset-password', async (req, res) => {
  try {
    const { secretKey, newPassword } = req.body;
    if (secretKey !== 'VIMSA_UNLOCK_2026') {
      return res.status(403).json({ success: false, message: 'Invalid secret key' });
    }
    const bcryptjs = await import('bcryptjs');
    const salt = await bcryptjs.default.genSalt(10);
    const hashedPassword = await bcryptjs.default.hash(newPassword || 'Admin@VIMSA2026', salt);

    const result = await User.updateMany(
      { role: { $in: ['admin', 'superadmin'] } },
      { $set: { 
        password: hashedPassword, 
        failedLoginAttempts: 0, 
        lockUntil: null, 
        isVerified: true 
      }}
    );
    res.json({ 
      success: true, 
      message: `Password reset for ${result.modifiedCount} admin account(s)`,
      newPassword: newPassword || 'Admin@VIMSA2026'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
