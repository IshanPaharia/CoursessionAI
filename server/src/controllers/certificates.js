import sql from '../db/index.js';
import crypto from 'crypto';

export async function getCertificate(req, res, next) {
  try {
    const { courseId } = req.params;

    const cert = await sql`
      SELECT cert.*, c.title AS course_title, u.email, u.display_name
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      JOIN users u ON u.id = cert.user_id
      WHERE cert.course_id = ${courseId} AND cert.user_id = ${req.userId}
    `;

    if (cert.length > 0) {
      return res.json({ certificate: cert[0] });
    }

    res.json({ certificate: null });
  } catch (err) {
    next(err);
  }
}

export async function generateCertificate(req, res, next) {
  try {
    const { courseId } = req.params;

    // Verify course ownership
    const courseRows = await sql`
      SELECT c.*, 
        (SELECT COUNT(*) FROM videos v WHERE v.course_id = c.id) AS video_count,
        (SELECT COUNT(*) FROM videos v
         JOIN progress p ON p.video_id = v.id AND p.user_id = c.user_id AND p.is_watched = true
         WHERE v.course_id = c.id) AS watched_count
      FROM courses c
      WHERE c.id = ${courseId} AND c.user_id = ${req.userId}
    `;

    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseRows[0];
    const videoCount = Number(course.video_count);
    const watchedCount = Number(course.watched_count);

    if (videoCount === 0 || watchedCount < videoCount) {
      return res.status(400).json({
        error: `Complete all videos first (${watchedCount}/${videoCount} done)`,
      });
    }

    // Check if already exists
    const existing = await sql`
      SELECT * FROM certificates WHERE course_id = ${courseId} AND user_id = ${req.userId}
    `;
    if (existing.length > 0) {
      return res.json({ certificate: existing[0] });
    }

    const certificateUid = crypto.randomBytes(8).toString('hex');

    const rows = await sql`
      INSERT INTO certificates (user_id, course_id, certificate_uid)
      VALUES (${req.userId}, ${courseId}, ${certificateUid})
      RETURNING *
    `;

    // Fetch full data
    const cert = await sql`
      SELECT cert.*, c.title AS course_title, u.email, u.display_name
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      JOIN users u ON u.id = cert.user_id
      WHERE cert.id = ${rows[0].id}
    `;

    res.status(201).json({ certificate: cert[0] });
  } catch (err) {
    next(err);
  }
}

export async function getCertificateByUid(req, res, next) {
  try {
    const { uid } = req.params;

    const cert = await sql`
      SELECT cert.*, c.title AS course_title, u.email, u.display_name,
        (SELECT COUNT(*) FROM videos v WHERE v.course_id = c.id) AS video_count,
        (SELECT COALESCE(SUM(v.duration), 0) FROM videos v WHERE v.course_id = c.id) AS total_duration
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      JOIN users u ON u.id = cert.user_id
      WHERE cert.certificate_uid = ${uid}
    `;

    if (cert.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate: cert[0] });
  } catch (err) {
    next(err);
  }
}
