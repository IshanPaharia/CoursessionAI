import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import sql from '../db/index.js';

const router = Router();

router.use(requireAuth);

router.put('/:id', async (req, res, next) => {
  try {
    const { title, moduleId, orderIndex } = req.body;

    const rows = await sql`
      UPDATE videos SET
        title = COALESCE(${title || null}, title),
        module_id = COALESCE(${moduleId || null}, module_id),
        order_index = COALESCE(${orderIndex ?? null}, order_index)
      WHERE id = ${req.params.id}
        AND course_id IN (SELECT id FROM courses WHERE user_id = ${req.userId})
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
