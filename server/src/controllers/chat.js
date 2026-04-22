import sql from '../db/index.js';
import { chatWithContext } from '../services/gemini.js';

export async function sendMessage(req, res, next) {
  try {
    const { videoId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const videoRows = await sql`
      SELECT v.* FROM videos v
      JOIN courses c ON c.id = v.course_id
      WHERE v.id = ${videoId} AND c.user_id = ${req.userId}
    `;
    if (videoRows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoRows[0];

    // Store user message
    await sql`
      INSERT INTO chat_messages (user_id, video_id, role, content)
      VALUES (${req.userId}, ${videoId}, ${'user'}, ${message})
    `;

    // Get recent history for context
    const history = await sql`
      SELECT role, content FROM chat_messages
      WHERE user_id = ${req.userId} AND video_id = ${videoId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const messages = history.reverse().map(m => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await chatWithContext(messages, video.title, video.description || '');

    // Store AI reply
    await sql`
      INSERT INTO chat_messages (user_id, video_id, role, content)
      VALUES (${req.userId}, ${videoId}, ${'assistant'}, ${reply})
    `;

    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const { videoId } = req.params;

    const messages = await sql`
      SELECT role, content, created_at FROM chat_messages
      WHERE user_id = ${req.userId} AND video_id = ${videoId}
      ORDER BY created_at ASC
    `;

    res.json({ messages });
  } catch (err) {
    next(err);
  }
}
