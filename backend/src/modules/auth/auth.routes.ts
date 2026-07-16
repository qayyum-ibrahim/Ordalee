import { Router } from 'express';
import { register, login, refresh, logout,getCurrentUser } from './auth.controller';
import { requireAuth } from './middleware/requireAuth';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me',requireAuth, getCurrentUser);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;