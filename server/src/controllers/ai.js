import sql from '../db/index.js';
import { generateCourseDescription, generateChapterSuggestions } from '../services/openrouter.js';

export async function aiGenerateDescription(req, res, next) {
  try {
    const { courseId } = req.body;

    const courseRows = await sql`
      SELECT * FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}
    `;
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const videos = await sql`
      SELECT title FROM videos WHERE course_id = ${courseId} ORDER BY order_index
    `;

    const description = await generateCourseDescription(
      courseRows[0].title,
      videos.map(v => v.title)
    );

    await sql`
      UPDATE courses SET description = ${description}, updated_at = NOW()
      WHERE id = ${courseId}
    `;

    res.json({ description });
  } catch (err) {
    next(err);
  }
}

export async function aiGenerateChapters(req, res, next) {
  try {
    const { courseId } = req.body;

    const courseRows = await sql`
      SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}
    `;
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const videos = await sql`
      SELECT id, title FROM videos WHERE course_id = ${courseId} ORDER BY order_index
    `;

    const chapters = await generateChapterSuggestions(videos.map(v => v.title));

    const result = chapters.map(ch => ({
      title: ch.title,
      videoIds: (ch.videoIndices || [])
        .map(idx => videos[idx - 1]?.id)
        .filter(Boolean),
    }));

    res.json({ chapters: result });
  } catch (err) {
    next(err);
  }
}

export async function aiApplyChapters(req, res, next) {
  try {
    const { courseId, chapters } = req.body;

    const courseRows = await sql`
      SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${req.userId}
    `;
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await sql`DELETE FROM modules WHERE course_id = ${courseId}`;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const modRows = await sql`
        INSERT INTO modules (course_id, title, order_index)
        VALUES (${courseId}, ${ch.title}, ${i})
        RETURNING id
      `;

      if (ch.videoIds?.length > 0) {
        for (const videoId of ch.videoIds) {
          await sql`
            UPDATE videos SET module_id = ${modRows[0].id}
            WHERE id = ${videoId} AND course_id = ${courseId}
          `;
        }
      }
    }

    res.json({ applied: true });
  } catch (err) {
    next(err);
  }
}
