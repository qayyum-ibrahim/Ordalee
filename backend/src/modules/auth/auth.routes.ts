import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, refresh, logout, getCurrentUser,
  verifyEmail, resendVerification, forgotPassword, resetPassword,
} from './auth.controller';
import { requireAuth } from './middleware/requireAuth';

// Scoped by email, not IP — this is what actually protects against
// repeated attempts on one account without punishing everyone who
// happens to share a NAT'd IP with that account's owner.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email || req.ip || 'unknown').toLowerCase(),
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' } },
});

// Refresh fires automatically and often for every legitimate session —
// a much higher ceiling, kept by IP since there's no email in this request.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment and try again.' } },
});

const router = Router();

router.post('/register', credentialLimiter, register);
router.post('/login', credentialLimiter, login);
router.post('/verify-email', credentialLimiter, verifyEmail);
router.post('/resend-verification', credentialLimiter, resendVerification);
router.post('/forgot-password', credentialLimiter, forgotPassword);
router.post('/reset-password', credentialLimiter, resetPassword);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', refreshLimiter, logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;