import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllCourses,
  createCourse,
  getCourse,
  getLastWatched,
  togglePin,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAllCourses);
router.post('/', createCourse);
router.get('/last-watched', getLastWatched);
router.patch('/:id/pin', togglePin);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
