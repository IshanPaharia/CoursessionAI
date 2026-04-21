import sql from '../db/index.js';
import {
  extractPlaylistId,
  fetchPlaylistDetails,
  fetchPlaylistItems,
  fetchVideoDurations,
} from '../services/youtube.js';
import {
  applyChapterSuggestions,
  buildChapterSuggestions,
  reorderCourseVideos,
} from '../services/courseAi.js';

function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export async function getAllCourses(req, res, next) {
  try {
    const { search, tag } = req.query;

    let courses = await sql`
      SELECT c.*,
        (SELECT COUNT(*) FROM videos v WHERE v.course_id = c.id) AS video_count,
        (SELECT COUNT(*) FROM videos v
         JOIN progress p ON p.video_id = v.id AND p.user_id = c.user_id AND p.is_watched = true
         WHERE v.course_id = c.id) AS watched_count,
        (SELECT COALESCE(SUM(v.duration), 0) FROM videos v WHERE v.course_id = c.id) AS total_duration,
        (SELECT COALESCE(SUM(v.duration), 0) FROM videos v
         JOIN progress p ON p.video_id = v.id AND p.user_id = c.user_id AND p.is_watched = true
         WHERE v.course_id = c.id) AS watched_duration
      FROM courses c
      WHERE c.user_id = ${req.userId}
      ORDER BY c.is_pinned DESC NULLS LAST, c.updated_at DESC
    `;

    // Apply search filter
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }

    // Apply tag filter
    if (tag) {
      const taggedCourseIds = await sql`
        SELECT ct.course_id FROM course_tags ct
        JOIN tags t ON t.id = ct.tag_id
        WHERE t.id = ${tag} AND t.user_id = ${req.userId}
      `;
      const ids = new Set(taggedCourseIds.map(r => r.course_id));
      courses = courses.filter(c => ids.has(c.id));
    }

    // Attach tags to each course
    const allTags = await sql`
      SELECT ct.course_id, t.id, t.name, t.color
      FROM course_tags ct
      JOIN tags t ON t.id = ct.tag_id
      WHERE t.user_id = ${req.userId}
    `;
    const tagMap = {};
    for (const t of allTags) {
      if (!tagMap[t.course_id]) tagMap[t.course_id] = [];
      tagMap[t.course_id].push({ id: t.id, name: t.name, color: t.color });
    }

    courses = courses.map(c => ({ ...c, tags: tagMap[c.id] || [] }));

    res.json({ courses });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const {
      playlistUrl,
      aiGenerateVideoOrder,
      aiGenerateChapters,
    } = req.body;

    if (!playlistUrl) {
      return res.status(400).json({ error: 'playlistUrl is required' });
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return res.status(400).json({ error: 'Invalid YouTube playlist URL' });
    }

    const details = await fetchPlaylistDetails(playlistId);
    const items = await fetchPlaylistItems(playlistId);

    if (items.length === 0) {
      return res.status(400).json({ error: 'Playlist is empty or not accessible' });
    }

    const videoIds = items.map(i => i.youtubeId);
    const durations = await fetchVideoDurations(videoIds);
    const shouldReorderVideos = toBool(aiGenerateVideoOrder);
    const shouldGenerateChapters = toBool(aiGenerateChapters);

    const courseRows = await sql`
      INSERT INTO courses (
        user_id,
        playlist_url,
        title,
        description,
        thumbnail_url,
        ai_generate_video_order,
        ai_generate_chapters
      )
      VALUES (
        ${req.userId},
        ${playlistUrl},
        ${details.title},
        ${details.description},
        ${details.thumbnailUrl},
        ${shouldReorderVideos},
        ${shouldGenerateChapters}
      )
      RETURNING *
    `;
    const course = courseRows[0];

    const moduleRows = await sql`
      INSERT INTO modules (course_id, title, order_index)
      VALUES (${course.id}, ${'All Videos'}, ${0})
      RETURNING *
    `;
    const mod = moduleRows[0];

    for (const item of items) {
      await sql`
        INSERT INTO videos (course_id, module_id, youtube_id, title, description, duration, thumbnail_url, order_index)
        VALUES (
          ${course.id}, ${mod.id}, ${item.youtubeId}, ${item.title},
          ${item.description}, ${durations[item.youtubeId] || 0},
          ${item.thumbnailUrl}, ${item.position}
        )
      `;
    }

    let modules = [mod];
    let videos = await sql`
      SELECT * FROM videos WHERE course_id = ${course.id} ORDER BY order_index
    `;

    if (shouldReorderVideos) {
      try {
        const reordered = await reorderCourseVideos(course.id, req.userId);
        videos = reordered.videos;
      } catch (err) {
        console.error('Auto AI sort failed:', err);
      }
    }

    if (shouldGenerateChapters) {
      try {
        const chapters = await buildChapterSuggestions(course.id, req.userId);
        const applied = await applyChapterSuggestions(course.id, req.userId, chapters);
        modules = applied.modules;
        videos = applied.videos;
      } catch (err) {
        console.error('Auto AI chapter generation failed:', err);
      }
    }

    res.status(201).json({
      course: { ...course, video_count: videos.length, watched_count: 0 },
      modules,
      videos,
    });
  } catch (err) {
    console.error('createCourse error:', err.message);
    next(err);
  }
}

export async function togglePin(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await sql`
      UPDATE courses SET is_pinned = NOT COALESCE(is_pinned, false)
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id, is_pinned
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ id: rows[0].id, isPinned: rows[0].is_pinned });
  } catch (err) {
    next(err);
  }
}

export async function getLastWatched(req, res, next) {
  try {
    const rows = await sql`
      SELECT c.*, c.last_watched_video_id,
        v.title AS video_title, v.youtube_id AS video_youtube_id, v.thumbnail_url AS video_thumbnail,
        (SELECT COUNT(*) FROM videos vv WHERE vv.course_id = c.id) AS video_count,
        (SELECT COUNT(*) FROM videos vv
         JOIN progress p ON p.video_id = vv.id AND p.user_id = c.user_id AND p.is_watched = true
         WHERE vv.course_id = c.id) AS watched_count
      FROM courses c
      LEFT JOIN videos v ON v.id = c.last_watched_video_id
      WHERE c.user_id = ${req.userId}
        AND c.last_watched_at IS NOT NULL
      ORDER BY c.last_watched_at DESC
      LIMIT 1
    `;

    res.json({ lastWatched: rows[0] || null });
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req, res, next) {
  try {
    const courseRows = await sql`
      SELECT * FROM courses WHERE id = ${req.params.id} AND user_id = ${req.userId}
    `;

    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRows[0];
    const modules = await sql`
      SELECT * FROM modules WHERE course_id = ${course.id} ORDER BY order_index
    `;
    const videos = await sql`
      SELECT * FROM videos WHERE course_id = ${course.id} ORDER BY order_index
    `;
    const progress = await sql`
      SELECT p.* FROM progress p
      JOIN videos v ON v.id = p.video_id
      WHERE v.course_id = ${course.id} AND p.user_id = ${req.userId}
    `;

    res.json({ course, modules, videos, progress });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { title, description, aiGenerateVideoOrder, aiGenerateChapters } = req.body;
    const rows = await sql`
      UPDATE courses
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          ai_generate_video_order = COALESCE(${aiGenerateVideoOrder ?? null}, ai_generate_video_order),
          ai_generate_chapters = COALESCE(${aiGenerateChapters ?? null}, ai_generate_chapters),
          updated_at = NOW()
      WHERE id = ${req.params.id} AND user_id = ${req.userId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const rows = await sql`
      DELETE FROM courses WHERE id = ${req.params.id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}
