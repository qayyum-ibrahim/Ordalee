import { Router } from 'express';
import { getDashboard } from './dashboard.controller';

const router = Router({ mergeParams: true });
router.get('/', getDashboard);

export default router;