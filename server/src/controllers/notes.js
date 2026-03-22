import sql from '../db/index.js';

export async function saveNote(req, res, next) {
  try {
    const { videoId } = req.params;
    const { notes } = req.body;

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

    const rows = await sql`
      SELECT notes FROM progress
      WHERE user_id = ${req.userId} AND video_id = ${videoId}
    `;

    res.json({ notes: rows[0]?.notes || '' });
  } catch (err) {
    next(err);
  }
}
