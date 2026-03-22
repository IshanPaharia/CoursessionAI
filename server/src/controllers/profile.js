import sql from '../db/index.js';

export async function getProfile(req, res, next) {
  try {
    const userRows = await sql`
      SELECT id, clerk_id, email, display_name, avatar_url, playback_speed, created_at
      FROM users WHERE id = ${req.userId}
    `;

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // Stats
    const courseStats = await sql`
      SELECT COUNT(*) as total_courses FROM courses WHERE user_id = ${req.userId}
    `;

    const videoStats = await sql`
      SELECT
        COUNT(*) as total_videos,
        COALESCE(SUM(v.duration), 0) as total_duration
      FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE c.user_id = ${req.userId}
    `;

    const watchedStats = await sql`
      SELECT
        COUNT(*) as watched_count,
        COALESCE(SUM(v.duration), 0) as watched_duration
      FROM progress p
      JOIN videos v ON v.id = p.video_id
      JOIN courses c ON c.id = v.course_id
      WHERE p.user_id = ${req.userId} AND p.is_watched = true
    `;

    // Streak
    const streakHistory = await sql`
      SELECT date, watch_count, watch_seconds
      FROM streaks
      WHERE user_id = ${req.userId}
      ORDER BY date DESC
      LIMIT 30
    `;

    res.json({
      user,
      stats: {
        totalCourses: Number(courseStats[0].total_courses),
        totalVideos: Number(videoStats[0].total_videos),
        totalDuration: Number(videoStats[0].total_duration),
        watchedVideos: Number(watchedStats[0].watched_count),
        watchedDuration: Number(watchedStats[0].watched_duration),
      },
      streakHistory: streakHistory.map(h => ({
        date: h.date,
        watchCount: h.watch_count,
        watchSeconds: h.watch_seconds,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { displayName, playbackSpeed } = req.body;

    const rows = await sql`
      UPDATE users SET
        display_name = COALESCE(${displayName ?? null}, display_name),
        playback_speed = COALESCE(${playbackSpeed ?? null}, playback_speed)
      WHERE id = ${req.userId}
      RETURNING id, clerk_id, email, display_name, avatar_url, playback_speed
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}
