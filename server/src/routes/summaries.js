import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateSummary, getSummary } from '../controllers/summaries.js';

const router = Router();

router.use(requireAuth);

router.post('/:videoId/generate', generateSummary);
router.get('/:videoId', getSummary);

export default router;
