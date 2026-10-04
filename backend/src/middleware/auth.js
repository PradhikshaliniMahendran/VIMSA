import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/UserSchema.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (!['admin', 'superadmin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    next();
  });
};

export const requireSuperAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
    next();
  });
};
