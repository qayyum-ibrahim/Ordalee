import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, refresh, logout, getCurrentUser,
  verifyEmail, resendVerification, forgotPassword, resetPassword,
} from './auth.controller';
import { requireAuth } from './middleware/requireAuth';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' } },
});

const router = Router();
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;