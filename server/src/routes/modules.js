import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createModule, updateModule, deleteModule, reorderVideos } from '../controllers/modules.js';

const router = Router();

router.use(requireAuth);

router.post('/course/:courseId', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);
router.put('/course/:courseId/reorder', reorderVideos);

export default router;
