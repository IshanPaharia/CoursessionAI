import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiGenerateDescription, aiGenerateChapters, aiApplyChapters, aiReorderVideos } from '../controllers/ai.js';

const router = Router();

router.use(requireAuth);

router.post('/generate-description', aiGenerateDescription);
router.post('/generate-chapters', aiGenerateChapters);
router.post('/apply-chapters', aiApplyChapters);
router.post('/reorder-videos', aiReorderVideos);

export default router;
