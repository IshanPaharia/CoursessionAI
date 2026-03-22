import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStreak, recordActivity } from '../controllers/streaks.js';

const router = Router();

router.use(requireAuth);

router.get('/', getStreak);
router.post('/activity', recordActivity);

export default router;
