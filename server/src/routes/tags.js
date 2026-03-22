import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTags, createTag, deleteTag, tagCourse, untagCourse } from '../controllers/tags.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);
router.post('/:tagId/courses/:courseId', tagCourse);
router.delete('/:tagId/courses/:courseId', untagCourse);

export default router;
