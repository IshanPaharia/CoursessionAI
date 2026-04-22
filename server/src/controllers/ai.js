import sql from '../db/index.js';
import { generateCourseDescription } from '../services/gemini.js';
import {
  applyChapterSuggestions,
  buildChapterSuggestions,
  reorderCourseVideos,
} from '../services/courseAi.js';

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
    const result = await buildChapterSuggestions(courseId, req.userId);

    res.json({ chapters: result });
  } catch (err) {
    next(err);
  }
}

export async function aiApplyChapters(req, res, next) {
  try {
    const { courseId, chapters } = req.body;
    await applyChapterSuggestions(courseId, req.userId, chapters);

    res.json({ applied: true });
  } catch (err) {
    next(err);
  }
}

export async function aiReorderVideos(req, res, next) {
  try {
    const { courseId } = req.body;
    const result = await reorderCourseVideos(courseId, req.userId);

    res.json({ reordered: result.reordered });
  } catch (err) {
    next(err);
  }
}
