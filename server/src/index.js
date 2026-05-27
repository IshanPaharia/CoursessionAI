import './env.js';
import express from 'express';
import sql from './db/index.js';
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
const CLIENT_URL = process.env.CLIENT_URL?.trim();

if (!CLIENT_URL) {
  throw new Error('CLIENT_URL is required');
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.get('/api/health', async (_req, res) => {
  try {
    // Check DB health
    await sql`SELECT 1`;
    
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests. Please wait a few minutes and try again.',
  },
});

const limitAiPost = (req, res, next) => {
  if (req.method !== 'POST') return next();
  return aiLimiter(req, res, next);
};

app.use(clerkAuth);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/quizzes/generate', aiLimiter);
app.use('/api/quizzes', quizRoutes);
app.use('/api/summaries/:videoId/generate', aiLimiter);
app.use('/api/summaries', summaryRoutes);
app.use('/api/chat', limitAiPost, chatRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/certificates', certificateRoutes);


function isNeonError(err) {
  const message = String(err?.message || '').toLowerCase();
  const code = err?.code || err?.cause?.code;

  // Don't treat actual Postgres query errors (like unique constraint violations) as connection timeouts
  // Postgres error codes are 5 characters (e.g. '23505').
  if (typeof err?.code === 'string' && err.code.length === 5) {
    return false;
  }

  return (
    message.includes('fetch failed')
    || message.includes('timeout')
    || code === 'UND_ERR_CONNECT_TIMEOUT'
    || code === 'ECONNRESET'
    || code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
  );
}

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  if (err.status === 401 && err.code === 'USER_NOT_SYNCED') {
    return res.status(401).json({
      error: 'Account setup is incomplete. Please sign out and sign in again.',
      code: 'USER_NOT_SYNCED',
    });
  }

  if (err.status === 401 && err.code === 'UNAUTHENTICATED') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHENTICATED',
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Request failed',
    });
  }

  if (isNeonError(err)) {
    return res.status(503).json({
      error: 'Database temporarily unavailable. Please try again.',
      details: err.message,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  // Server started
});
