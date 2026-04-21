import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { clerkAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import videoRoutes from './routes/videos.js';
import progressRoutes from './routes/progress.js';
import moduleRoutes from './routes/modules.js';
import noteRoutes from './routes/notes.js';
import aiRoutes from './routes/ai.js';
import streakRoutes from './routes/streaks.js';
import quizRoutes from './routes/quizzes.js';
import summaryRoutes from './routes/summaries.js';
import chatRoutes from './routes/chat.js';
import tagRoutes from './routes/tags.js';
import profileRoutes from './routes/profile.js';
import certificateRoutes from './routes/certificates.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').trim(),
  credentials: true,
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(clerkAuth);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

function isNeonError(err) {
  const name = String(err?.name || '').toLowerCase();
  const message = String(err?.message || '').toLowerCase();
  const code = err?.code || err?.cause?.code;

  return (
    name.includes('neon')
    || message.includes('neon')
    || message.includes('database')
    || code === 'UND_ERR_CONNECT_TIMEOUT'
    || code === 'ECONNRESET'
    || code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
  );
}

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Request failed',
    });
  }

  if (isNeonError(err)) {
    return res.status(503).json({
      error: 'Database temporarily unavailable. Please try again.',
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
