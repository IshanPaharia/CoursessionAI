import sql from '../db/index.js';

export async function saveNote(req, res, next) {
  try {
    const { videoId } = req.params;
    const { notes } = req.body;

    const videoRows = await sql`
      SELECT v.id FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE v.id = ${videoId} AND c.user_id = ${req.userId}
    `;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    const rows = await sql`
      INSERT INTO progress (user_id, video_id, notes)
      VALUES (${req.userId}, ${videoId}, ${notes || ''})
      ON CONFLICT (user_id, video_id)
      DO UPDATE SET notes = ${notes || ''}, updated_at = NOW()
      RETURNING *
    `;

    res.json({ progress: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getNote(req, res, next) {
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

    const rows = await sql`
      SELECT notes FROM progress
      WHERE user_id = ${req.userId} AND video_id = ${videoId}
    `;

    res.json({ notes: rows[0]?.notes || '' });
  } catch (err) {
    next(err);
  }
}
