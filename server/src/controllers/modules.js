import sql from '../db/index.js';

export async function createModule(req, res, next) {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    const courseRows = await sql`
      SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}
    `;
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const maxOrder = await sql`
      SELECT COALESCE(MAX(order_index), -1) as max_idx FROM modules WHERE course_id = ${courseId}
    `;

    const rows = await sql`
      INSERT INTO modules (course_id, title, description, order_index)
      VALUES (${courseId}, ${title || 'New Chapter'}, ${description || null}, ${maxOrder[0].max_idx + 1})
      RETURNING *
    `;

    res.status(201).json({ module: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateModule(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, orderIndex } = req.body;

    const rows = await sql`
      UPDATE modules SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        order_index = COALESCE(${orderIndex ?? null}, order_index)
      WHERE id = ${id}
        AND course_id IN (SELECT id FROM courses WHERE user_id = ${req.userId})
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ module: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteModule(req, res, next) {
  try {
    const { id } = req.params;

    // Verify module ownership first
    const moduleRows = await sql`
      SELECT m.id FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = ${id} AND c.user_id = ${req.userId}
    `;
    if (moduleRows.length === 0) {
      return res.status(404).json({ error: 'Module not found or access denied' });
    }

    await sql`
      UPDATE videos SET module_id = NULL
      WHERE module_id = ${id}
    `;

    await sql`
      DELETE FROM modules
      WHERE id = ${id}
    `;

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function reorderVideos(req, res, next) {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    for (const { videoId, moduleId, orderIndex } of updates) {
      await sql`
        UPDATE videos SET
          module_id = ${moduleId ?? null},
          order_index = ${orderIndex}
        WHERE id = ${videoId}
          AND course_id IN (SELECT id FROM courses WHERE user_id = ${req.userId})
      `;
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
}
