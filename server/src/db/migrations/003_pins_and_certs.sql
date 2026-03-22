-- Pin/unpin courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  certificate_uid VARCHAR UNIQUE NOT NULL,
  UNIQUE(user_id, course_id)
);
