import sql from '../db/index.js';
import { generateVideoSummary } from '../services/openrouter.js';

export async function generateSummary(req, res, next) {
  try {
    const { videoId } = req.params;

    const videoRows = await sql`
      SELECT v.* FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE v.id = ${videoId} AND c.user_id = ${req.userId}
    `;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoRows[0];

    // Check cache first
    const cached = await sql`
      SELECT * FROM video_summaries WHERE video_id = ${videoId}
    `;
    if (cached.length > 0) {
      return res.json({ summary: cached[0].summary, cached: true });
    }

    const summary = await generateVideoSummary(video.title, video.description || '');

    await sql`
      INSERT INTO video_summaries (video_id, summary)
      VALUES (${videoId}, ${summary})
      ON CONFLICT (video_id) DO UPDATE SET summary = ${summary}
    `;

    res.json({ summary, cached: false });
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req, res, next) {
  try {
    const { videoId } = req.params;

    const rows = await sql`
      SELECT * FROM video_summaries WHERE video_id = ${videoId}
    `;

    res.json({ summary: rows[0]?.summary || null });
  } catch (err) {
    next(err);
  }
}
