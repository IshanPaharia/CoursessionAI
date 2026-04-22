import sql from '../db/index.js';
import { generateQuizQuestions } from '../services/gemini.js';

export async function generateQuiz(req, res, next) {
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
    const questions = await generateQuizQuestions(video.title, video.description || '');

    const rows = await sql`
      INSERT INTO quizzes (video_id, user_id, questions)
      VALUES (${videoId}, ${req.userId}, ${JSON.stringify(questions)})
      RETURNING *
    `;

    res.status(201).json({ quiz: { ...rows[0], questions } });
  } catch (err) {
    next(err);
  }
}

export async function getQuiz(req, res, next) {
  try {
    const { videoId } = req.params;

    const rows = await sql`
      SELECT * FROM quizzes
      WHERE video_id = ${videoId} AND user_id = ${req.userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.json({ quiz: null });
    }

    const quiz = rows[0];
    const attempts = await sql`
      SELECT * FROM quiz_attempts
      WHERE quiz_id = ${quiz.id} AND user_id = ${req.userId}
      ORDER BY created_at DESC
    `;

    res.json({ quiz, attempts });
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quizRows = await sql`
      SELECT * FROM quizzes WHERE id = ${quizId} AND user_id = ${req.userId}
    `;
    if (quizRows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = quizRows[0].questions;
    let score = 0;

    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) {
        score++;
      }
    }

    const rows = await sql`
      INSERT INTO quiz_attempts (quiz_id, user_id, answers, score)
      VALUES (${quizId}, ${req.userId}, ${JSON.stringify(answers)}, ${score})
      RETURNING *
    `;

    res.status(201).json({
      attempt: rows[0],
      totalQuestions: questions.length,
      score,
    });
  } catch (err) {
    next(err);
  }
}
