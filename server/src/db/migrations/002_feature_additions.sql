-- Learning streaks
CREATE TABLE IF NOT EXISTS streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  watch_count INTEGER DEFAULT 0,
  watch_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI summaries cache
CREATE TABLE IF NOT EXISTS video_summaries (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  color VARCHAR DEFAULT '#a855f7',
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS course_tags (
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(course_id, tag_id)
);

-- User preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS playback_speed NUMERIC(2,1) DEFAULT 1.0;

-- Last watched tracking
ALTER TABLE progress ADD COLUMN IF NOT EXISTS last_position INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS last_watched_video_id INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP;
