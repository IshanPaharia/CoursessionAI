import sql from '../db/index.js';

export async function getTags(req, res, next) {
  try {
    const tags = await sql`
      SELECT t.*, COALESCE(
        (SELECT json_agg(ct.course_id) FROM course_tags ct WHERE ct.tag_id = t.id),
        '[]'
      ) AS course_ids
      FROM tags t
      WHERE t.user_id = ${req.userId}
      ORDER BY t.name
    `;
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}

export async function createTag(req, res, next) {
  try {
    const { name, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const rows = await sql`
      INSERT INTO tags (user_id, name, color)
      VALUES (${req.userId}, ${name.trim()}, ${color || '#a855f7'})
      ON CONFLICT (user_id, name) DO UPDATE SET color = COALESCE(${color}, tags.color)
      RETURNING *
    `;

    res.status(201).json({ tag: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req, res, next) {
  try {
    const rows = await sql`
      DELETE FROM tags WHERE id = ${req.params.id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function tagCourse(req, res, next) {
  try {
    const { tagId, courseId } = req.params;

    // Verify ownership
    const tagRows = await sql`SELECT id FROM tags WHERE id = ${tagId} AND user_id = ${req.userId}`;
    if (tagRows.length === 0) return res.status(404).json({ error: 'Tag not found' });

    const courseRows = await sql`SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}`;
    if (courseRows.length === 0) return res.status(404).json({ error: 'Course not found' });

    await sql`
      INSERT INTO course_tags (course_id, tag_id)
      VALUES (${courseId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;

    res.json({ tagged: true });
  } catch (err) {
    next(err);
  }
}

export async function untagCourse(req, res, next) {
  try {
    const { tagId, courseId } = req.params;

    // Verify ownership
    const tagRows = await sql`SELECT id FROM tags WHERE id = ${tagId} AND user_id = ${req.userId}`;
    if (tagRows.length === 0) return res.status(404).json({ error: 'Tag not found' });

    const courseRows = await sql`SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}`;
    if (courseRows.length === 0) return res.status(404).json({ error: 'Course not found' });

    await sql`
      DELETE FROM course_tags
      WHERE course_id = ${courseId} AND tag_id = ${tagId}
    `;

    res.json({ untagged: true });
  } catch (err) {
    next(err);
  }
}
