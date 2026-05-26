import sql from '../db/index.js';

export async function createBookmark(req, res, next) {
  try {
    const { videoId } = req.params;
    const { timestamp, note } = req.body;

    const videoRows = await sql`
      SELECT v.id FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE v.id = ${videoId} AND c.user_id = ${req.userId}
    `;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    const rows = await sql`
      INSERT INTO bookmarks (user_id, video_id, timestamp, note)
      VALUES (${req.userId}, ${videoId}, ${timestamp || 0}, ${note || ''})
      RETURNING *
    `;

    res.status(201).json({ bookmark: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getBookmarks(req, res, next) {
  try {
    const { videoId } = req.params;

    const videoRows = await sql`
      SELECT v.id FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE v.id = ${videoId} AND c.user_id = ${req.userId}
    `;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    const bookmarks = await sql`
      SELECT * FROM bookmarks
      WHERE user_id = ${req.userId} AND video_id = ${videoId}
      ORDER BY timestamp ASC
    `;

    res.json({ bookmarks });
  } catch (err) {
    next(err);
  }
}

export async function deleteBookmark(req, res, next) {
  try {
    const { id } = req.params;

    const rows = await sql`
      DELETE FROM bookmarks WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}
