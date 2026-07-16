import { Router } from 'express';
import { requireAuth } from '../auth/middleware/requireAuth';
import { requireBusinessOwnership } from './middleware/requireBusinessOwnership';
import { createBusiness, getMyBusiness, updateBusiness } from './business.controller';

const router = Router();

router.use(requireAuth);
router.post('/', createBusiness);
router.get('/me', getMyBusiness);
router.patch('/:businessId', requireBusinessOwnership, updateBusiness);

export default router;