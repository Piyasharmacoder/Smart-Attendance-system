import express from 'express';

import {
  register,
  login,
  getProfile,
  getUsers
} from '../controllers/authController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔓 Public
router.post('/register', register);
router.post('/login', login);

// 🔐 Protected
router.get('/profile', protect, getProfile);

// 🔒 Role-based
router.get('/users', protect, authorize('admin', 'manager'), getUsers);

export default router;