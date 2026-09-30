import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, authorize('Admin'), getUsers);

export default router;
