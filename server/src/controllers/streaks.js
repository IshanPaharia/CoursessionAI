import sql from '../db/index.js';

export async function getStreak(req, res, next) {
  try {
    // Current streak count (consecutive days including today)
    const today = new Date().toISOString().split('T')[0];

    const history = await sql`
      SELECT date, watch_count, watch_seconds
      FROM streaks
      WHERE user_id = ${req.userId}
      ORDER BY date DESC
      LIMIT 30
    `;

    let currentStreak = 0;
    const checkDate = new Date();

    for (let i = 0; i < 60; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const found = history.find(h => h.date.toISOString().split('T')[0] === dateStr);

      if (found && found.watch_count > 0) {
        currentStreak++;
      } else if (i > 0) {
        // Allow today to be empty (streak not broken yet)
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const todayRecord = history.find(h => h.date.toISOString().split('T')[0] === today);

    res.json({
      currentStreak,
      today: {
        watchCount: todayRecord?.watch_count || 0,
        watchSeconds: todayRecord?.watch_seconds || 0,
      },
      history: history.map(h => ({
        date: h.date,
        watchCount: h.watch_count,
        watchSeconds: h.watch_seconds,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function recordActivity(req, res, next) {
  try {
    const { watchSeconds } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const rows = await sql`
      INSERT INTO streaks (user_id, date, watch_count, watch_seconds)
      VALUES (${req.userId}, ${today}, 1, ${watchSeconds || 0})
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        watch_count = streaks.watch_count + 1,
        watch_seconds = streaks.watch_seconds + ${watchSeconds || 0}
      RETURNING *
    `;

    res.json({ streak: rows[0] });
  } catch (err) {
    next(err);
  }
}
