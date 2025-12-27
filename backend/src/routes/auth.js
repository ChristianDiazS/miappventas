import express from 'express';
import {
  register,
  login,
  getProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter, bruteForceProtection } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register);
// Login con rate limiting y protección contra fuerza bruta
router.post('/login', loginLimiter, bruteForceProtection, login);
router.get('/profile', authenticateToken, getProfile);

export default router;
