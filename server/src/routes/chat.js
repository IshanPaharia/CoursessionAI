import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sendMessage, getHistory } from '../controllers/chat.js';

const router = Router();

router.use(requireAuth);

router.post('/:videoId', sendMessage);
router.get('/:videoId', getHistory);

export default router;
