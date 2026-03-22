import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateQuiz, getQuiz, submitQuiz } from '../controllers/quizzes.js';

const router = Router();

router.use(requireAuth);

router.post('/generate/:videoId', generateQuiz);
router.get('/:videoId', getQuiz);
router.post('/:quizId/submit', submitQuiz);

export default router;
