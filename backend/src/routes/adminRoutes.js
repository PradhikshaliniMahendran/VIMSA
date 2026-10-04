import express from 'express';
import {
  getDashboardStats, getRevenueChart, adminGetAllUsers, adminToggleUserStatus,
  adminManageReturns, adminUpdateReturn, adminGetCategories, adminCreateCategory,
  adminUpdateCategory, adminDeleteCategory, adminGetNewsletterSubscribers,
  adminGetContactMessages, adminUpdateContactMessage,
  adminGetCollections, adminCreateCollection, adminUpdateCollection, adminDeleteCollection
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);

router.get('/users', adminGetAllUsers);
router.patch('/users/:id/toggle-status', adminToggleUserStatus);

router.get('/returns', adminManageReturns);
router.patch('/returns/:id', adminUpdateReturn);

router.get('/categories', adminGetCategories);
router.post('/categories', adminCreateCategory);
router.put('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

router.get('/collections', adminGetCollections);
router.post('/collections', adminCreateCollection);
router.put('/collections/:id', adminUpdateCollection);
router.delete('/collections/:id', adminDeleteCollection);

router.get('/newsletter', adminGetNewsletterSubscribers);
router.get('/messages', adminGetContactMessages);
router.patch('/messages/:id', adminUpdateContactMessage);

export default router;
