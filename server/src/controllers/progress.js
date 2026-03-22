import sql from '../db/index.js';

export async function updateProgress(req, res, next) {
  try {
    const { videoId } = req.params;
    const { isWatched, notes } = req.body;

    const videoRows = await sql`SELECT id, course_id, duration FROM videos WHERE id = ${videoId}`;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const rows = await sql`
      INSERT INTO progress (user_id, video_id, is_watched, completed_at, notes)
      VALUES (
        ${req.userId},
        ${videoId},
        ${isWatched ?? false},
        ${isWatched ? new Date().toISOString() : null},
        ${notes ?? null}
      )
      ON CONFLICT (user_id, video_id)
      DO UPDATE SET
        is_watched = COALESCE(${isWatched}, progress.is_watched),
        completed_at = CASE WHEN ${isWatched} = true THEN NOW() ELSE progress.completed_at END,
        notes = COALESCE(${notes}, progress.notes),
        updated_at = NOW()
      RETURNING *
    `;

    // Record streak activity + update last watched
    if (isWatched) {
      const video = videoRows[0];
      const today = new Date().toISOString().split('T')[0];

      await sql`
        INSERT INTO streaks (user_id, date, watch_count, watch_seconds)
        VALUES (${req.userId}, ${today}, 1, ${video.duration || 0})
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          watch_count = streaks.watch_count + 1,
          watch_seconds = streaks.watch_seconds + ${video.duration || 0}
      `;

      await sql`
        UPDATE courses
        SET last_watched_video_id = ${videoId}, last_watched_at = NOW()
        WHERE id = ${video.course_id}
      `;
    }

    res.json({ progress: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getCourseProgress(req, res, next) {
  try {
    const { courseId } = req.params;

    const progress = await sql`
      SELECT p.* FROM progress p
      JOIN videos v ON v.id = p.video_id
      WHERE v.course_id = ${courseId} AND p.user_id = ${req.userId}
    `;

    res.json({ progress });
  } catch (err) {
    next(err);
  }
}
