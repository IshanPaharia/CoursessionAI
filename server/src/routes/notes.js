import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { saveNote, getNote } from '../controllers/notes.js';
import { createBookmark, getBookmarks, deleteBookmark } from '../controllers/bookmarks.js';

const router = Router();

router.use(requireAuth);

router.post('/:videoId/notes', saveNote);
router.get('/:videoId/notes', getNote);

router.post('/:videoId/bookmarks', createBookmark);
router.get('/:videoId/bookmarks', getBookmarks);
router.delete('/bookmarks/:id', deleteBookmark);

export default router;
