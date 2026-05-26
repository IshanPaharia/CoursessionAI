import sql, { transaction } from '../db/index.js';
import { generateChapterSuggestions, generateVideoOrder } from './gemini.js';

async function assertCourseOwnership(courseId, userId) {
  const rows = await sql`
    SELECT id FROM courses WHERE id = ${courseId} AND user_id = ${userId}
  `;

  if (rows.length === 0) {
    const error = new Error('Course not found');
    error.status = 404;
    throw error;
  }
}

export async function reorderCourseVideos(courseId, userId) {
  await assertCourseOwnership(courseId, userId);

  const videos = await sql`
    SELECT * FROM videos WHERE course_id = ${courseId} ORDER BY order_index
  `;

  if (videos.length <= 1) {
    return { reordered: false, videos };
  }

  const correctOrder = await generateVideoOrder(videos.map(v => v.title));

  if (!Array.isArray(correctOrder) || correctOrder.length !== videos.length) {
    throw new Error('AI returned invalid order');
  }

  for (let newIdx = 0; newIdx < correctOrder.length; newIdx++) {
    const originalIdx = correctOrder[newIdx];
    const video = videos[originalIdx];

    if (video) {
      await sql`
        UPDATE videos SET order_index = ${newIdx}
        WHERE id = ${video.id} AND course_id = ${courseId}
      `;
    }
  }

  const reorderedVideos = await sql`
    SELECT * FROM videos WHERE course_id = ${courseId} ORDER BY order_index
  `;

  return { reordered: true, videos: reorderedVideos };
}

export async function buildChapterSuggestions(courseId, userId) {
  await assertCourseOwnership(courseId, userId);

  const videos = await sql`
    SELECT id, title FROM videos WHERE course_id = ${courseId} ORDER BY order_index
  `;

  if (videos.length === 0) {
    return [];
  }

  const chapters = await generateChapterSuggestions(videos.map(v => v.title));

  return chapters.map(ch => ({
    title: ch.title,
    videoIds: (ch.videoIndices || [])
      .map(idx => videos[idx - 1]?.id)
      .filter(Boolean),
  }));
}

export async function applyChapterSuggestions(courseId, userId, chapters) {
  await assertCourseOwnership(courseId, userId);

  if (!Array.isArray(chapters) || chapters.length === 0) {
    const modules = await sql`
      SELECT * FROM modules WHERE course_id = ${courseId} ORDER BY order_index
    `;
    const videos = await sql`
      SELECT * FROM videos WHERE course_id = ${courseId} ORDER BY order_index
    `;

    return { modules, videos };
  }

  await transaction(async (tx) => {
    await tx`DELETE FROM modules WHERE course_id = ${courseId}`;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const modRows = await tx`
        INSERT INTO modules (course_id, title, order_index)
        VALUES (${courseId}, ${ch.title}, ${i})
        RETURNING id
      `;

      if (ch.videoIds?.length > 0) {
        for (const videoId of ch.videoIds) {
          await tx`
            UPDATE videos SET module_id = ${modRows[0].id}
            WHERE id = ${videoId} AND course_id = ${courseId}
          `;
        }
      }
    }
  });

  const modules = await sql`
    SELECT * FROM modules WHERE course_id = ${courseId} ORDER BY order_index
  `;
  const videos = await sql`
    SELECT * FROM videos WHERE course_id = ${courseId} ORDER BY order_index
  `;

  return { modules, videos };
}
