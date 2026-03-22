import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProgress, getCourseProgress } from '../controllers/progress.js';

const router = Router();

router.use(requireAuth);

router.put('/:videoId', updateProgress);
router.get('/course/:courseId', getCourseProgress);

export default router;
