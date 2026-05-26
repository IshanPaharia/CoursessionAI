import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import sql from '../db/index.js';

const router = Router();

router.use(requireAuth);

router.put('/:id', async (req, res, next) => {
  try {
    const { title, moduleId, orderIndex } = req.body;

    if (moduleId) {
      const moduleRows = await sql`
        SELECT m.id, m.course_id FROM modules m
        JOIN courses c ON c.id = m.course_id
        WHERE m.id = ${moduleId} AND c.user_id = ${req.userId}
      `;
      if (moduleRows.length === 0) {
        return res.status(400).json({ error: 'Invalid module selection' });
      }

      const integrityRows = await sql`
        SELECT m.id FROM modules m
        JOIN videos v ON v.course_id = m.course_id
        WHERE m.id = ${moduleId}
          AND v.id = ${req.params.id}
          AND m.course_id = (SELECT course_id FROM videos WHERE id = ${req.params.id})
      `;
      if (integrityRows.length === 0) {
        return res.status(403).json({ error: 'Module does not belong to the same course as the video' });
      }
    }

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
