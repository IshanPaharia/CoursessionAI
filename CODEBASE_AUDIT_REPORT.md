# CoursessionAI Codebase Audit Report

Date: 2026-05-25

## 1. Project Overview

CoursessionAI is a full-stack web app that turns public YouTube playlists into structured course experiences. A signed-in user can import a playlist, browse generated course/video modules, watch embedded YouTube videos, mark lessons complete, take AI-generated quizzes, read AI summaries, take notes, create bookmarks, chat with an AI tutor, tag/pin courses, and claim a completion certificate.

Core user flows:

- Sign in/sign up with Clerk, then sync the Clerk user into the local `users` table.
- Import a YouTube playlist into a course, optionally AI-sort videos and AI-generate chapters.
- Open a course, watch videos, mark watched, track progress/streaks, use notes/bookmarks/quiz/summary/chat.
- Manage course title/description/order/AI settings in course settings.
- Tag, pin, search, delete courses from the dashboard.
- Generate and share a course completion certificate.

Tech stack:

- Frontend: React 19, Vite 7, React Router 7, TanStack Query 5, Tailwind CSS 4, lucide-react.
- Backend: Express 4, Node ESM, REST controllers/routes.
- Database: Neon Postgres via `@neondatabase/serverless`.
- Auth: Clerk React + `@clerk/express`, Clerk webhook via Svix.
- External APIs: YouTube Data API, Gemini OpenAI-compatible chat completions endpoint, Vercel Analytics/Speed Insights.

## 2. Architecture Map

Folder structure:

- `client/src/pages`: route-level screens: dashboard, course viewer, course settings, profile, landing, auth pages.
- `client/src/components`: reusable UI and feature widgets: quiz, summary, notes, bookmarks, chat, certificate modal, layout, auth sync.
- `client/src/hooks`: React Query API wrappers for courses, notes, chat, quizzes, summaries, tags, progress, streaks, certificates.
- `client/src/lib`: Axios client and toast store.
- `server/src/routes`: Express route declarations.
- `server/src/controllers`: request handlers and SQL ownership checks.
- `server/src/services`: YouTube, Gemini, and AI course reordering/chapter logic.
- `server/src/db`: Neon SQL wrapper and SQL migrations.

Layer flow:

`React page/component -> React Query hook -> Axios client with Clerk bearer token -> Express route -> requireAuth middleware -> controller -> Neon SQL -> external API/service when needed`.

Important data flows:

- Course import: `client/src/pages/Dashboard.jsx:39` calls `useCreateCourse`; `client/src/hooks/useCourses.js:27` posts `/api/courses`; `server/src/controllers/courses.js:78` fetches YouTube playlist details/items/durations, inserts course/module/videos, then optionally calls AI ordering/chapter generation.
- Watch/progress: `client/src/pages/CourseView.jsx:220` toggles watched state; `server/src/controllers/progress.js:13` upserts `progress`, increments `streaks`, and updates `courses.last_watched_*`.
- AI learning tools: summary/quiz/chat components call `/api/summaries`, `/api/quizzes`, `/api/chat`; server uses `server/src/services/gemini.js:130` to call Gemini and stores summaries/quizzes/chat history.

Patterns:

- React SPA + REST API.
- Controller/service split on the backend.
- SQL-first data access, no ORM.
- React Query cache invalidation as the frontend state synchronization pattern.

## 3. Feature Inventory

| Feature | Status | Owner files | Notes |
|---|---:|---|---|
| Clerk auth UI | PARTIAL | `App.jsx`, `SignInPage.jsx`, `SignUpPage.jsx`, `AuthSync.jsx`, `auth.js` | Client sends token, but `/api/auth/sync` trusts body `clerkId/email` and does not require auth: `server/src/routes/auth.js:63`. |
| Clerk webhook sync | BROKEN/PARTIAL | `server/src/routes/auth.js` | Webhook verification uses `JSON.stringify(req.body)` after global `express.json()`: `server/src/index.js:34`, `server/src/routes/auth.js:27`. Svix generally requires raw body bytes. |
| Course import | PARTIAL | `courses.js`, `youtube.js`, `courseAi.js` | Works conceptually, but no transaction around course/module/video inserts: `server/src/controllers/courses.js:107`. Partial data can remain if later inserts fail. |
| YouTube playlist ingestion | UNTESTED | `youtube.js` | No startup validation for `YOUTUBE_API_KEY`; API errors handled only in playlist items, less consistently in details/durations. |
| Dashboard search/tag/pin/delete | PARTIAL | `Dashboard.jsx`, `courses.js`, `tags.js`, `useTags.js` | Search is in-memory after fetching all courses: `server/src/controllers/courses.js:37`. `untagCourse` lacks ownership checks: `server/src/controllers/tags.js:81`. |
| Course viewer | WORKING/UNTESTED | `CourseView.jsx` | Build passes. Runtime not exercised against a real DB/API. |
| Progress/streaks | PARTIAL | `progress.js`, `streaks.js` | `updateProgress` does not verify video ownership: `server/src/controllers/progress.js:8`. Streak dates use server UTC via `toISOString()`, not user locale: `server/src/controllers/streaks.js:6`. |
| Notes | PARTIAL | `VideoNotes.jsx`, `notes.js` | Save note can create progress for any `videoId` without ownership validation: `server/src/controllers/notes.js:8`. |
| Bookmarks | PARTIAL | `VideoBookmarks.jsx`, `bookmarks.js` | Create/get bookmark scoped by user but not by owned video/course: `server/src/controllers/bookmarks.js:8`. Timestamp validation is weak. |
| AI summaries | PARTIAL | `VideoSummary.jsx`, `summaries.js`, `gemini.js` | Generate validates ownership, but plain GET summary does not: `server/src/controllers/summaries.js:45`. |
| AI quizzes | WORKING/UNTESTED | `VideoQuiz.jsx`, `quizzes.js`, `gemini.js` | Ownership checks exist for generate/submit. No validation of AI JSON shape beyond parse. |
| AI chat tutor | PARTIAL | `VideoChat.jsx`, `chat.js` | Send validates ownership; history does not verify video ownership, though it is filtered by user id: `server/src/controllers/chat.js:61`. |
| Course settings/manual reorder | PARTIAL | `CourseSettings.jsx`, `videos.js` | Manual reorder sends one request per video: `client/src/pages/CourseSettings.jsx:160`. `moduleId` is not validated against same course/user: `server/src/routes/videos.js:13`. |
| AI chapters/order | PARTIAL | `courseAi.js`, `ai.js`, `gemini.js` | `applyChapterSuggestions` deletes all modules before rebuilding, with no transaction: `server/src/services/courseAi.js:87`. |
| Certificates | BROKEN/PARTIAL | `certificates.js`, `CertificateModal.jsx` | Generation logic is server-side sound, but share URL points to client origin `/api/...`, which Vite/Vercel client cannot serve: `client/src/components/CertificateModal.jsx:13`. Print HTML interpolates unescaped user/course data: `client/src/components/CertificateModal.jsx:30`. |
| Profile | WORKING/UNTESTED | `profile.js`, `ProfilePage.jsx` | Basic stats and preferences exist. No input validation on playback speed/display name. |
| Module CRUD routes | DEAD CODE/PARTIAL | `modules.js` routes/controllers | No client calls found. `deleteModule` updates videos before checking ownership: `server/src/controllers/modules.js:60`. |
| `server/test_db.js` | BROKEN/DANGEROUS DEAD CODE | `server/test_db.js` | Drops entire public schema: `server/test_db.js:6`, then logs undefined `rows`: `server/test_db.js:9`. |

## 4. Database & Data Models

Schemas:

- `users`: `id serial`, `clerk_id varchar unique not null`, `email varchar unique not null`, `created_at timestamp`, plus `display_name varchar`, `avatar_url varchar`, `playback_speed numeric(2,1)`.
- `courses`: `id`, `user_id -> users(id)`, `playlist_url`, `title`, `description`, `thumbnail_url`, `created_at`, `updated_at`, `last_watched_video_id`, `last_watched_at`, `ai_generate_video_order boolean`, `ai_generate_chapters boolean`, `is_pinned boolean`.
- `modules`: `id`, `course_id -> courses(id) on delete cascade`, `title`, `description`, `order_index`, `created_at`.
- `videos`: `id`, `course_id -> courses(id) on delete cascade`, `module_id -> modules(id) on delete set null`, `youtube_id`, `title`, `description`, `duration integer`, `thumbnail_url`, `order_index`, `created_at`.
- `progress`: `id`, `user_id -> users(id)`, `video_id -> videos(id) on delete cascade`, `is_watched`, `completed_at`, `notes`, `created_at`, `updated_at`, `last_position`, unique `(user_id, video_id)`.
- `bookmarks`: `id`, `user_id -> users(id)`, `video_id -> videos(id) on delete cascade`, `timestamp integer`, `note`, `created_at`.
- `streaks`: `id`, `user_id -> users(id) on delete cascade`, `date date`, `watch_count`, `watch_seconds`, unique `(user_id, date)`.
- `quizzes`: `id`, `video_id`, `user_id`, `questions jsonb`, `created_at`.
- `quiz_attempts`: `id`, `quiz_id`, `user_id`, `answers jsonb`, `score`, `created_at`.
- `video_summaries`: `id`, `video_id unique`, `summary`, `created_at`.
- `chat_messages`: `id`, `user_id`, `video_id`, `role`, `content`, `created_at`.
- `tags`: `id`, `user_id`, `name`, `color`, unique `(user_id, name)`.
- `course_tags`: `course_id`, `tag_id`, composite primary key.
- `certificates`: `id`, `user_id`, `course_id`, `completed_at`, `certificate_uid unique`, unique `(user_id, course_id)`.

Schema drift/issues:

- Migration `004_course_ai_preferences.sql` duplicates columns already added in `002_feature_additions.sql`: `002_feature_additions.sql:72`, `004_course_ai_preferences.sql:1`.
- No migration history table; migrations are reapplied every time and rely entirely on `IF NOT EXISTS`.
- `courses.user_id`, `progress.user_id`, and `bookmarks.user_id` do not cascade on user delete. Clerk `user.deleted` can fail once a user has courses: `server/src/routes/auth.js:55`, `server/src/db/migrations/001_initial_schema.sql:10`.
- `last_watched_video_id` has no foreign key constraint: `server/src/db/migrations/002_feature_additions.sql:70`.

## 5. API Surface

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/api/health` | No | DB/app health check |
| POST | `/api/auth/callback` | No | Clerk webhook |
| POST | `/api/auth/sync` | No, but should be Yes | Creates/updates local user |
| GET | `/api/courses` | Yes | List courses with search/tag |
| POST | `/api/courses` | Yes | Import playlist as course |
| GET | `/api/courses/last-watched` | Yes | Last watched course |
| PATCH | `/api/courses/:id/pin` | Yes | Toggle pin |
| GET | `/api/courses/:id` | Yes | Course with modules/videos/progress |
| PUT | `/api/courses/:id` | Yes | Update title/description/AI prefs |
| DELETE | `/api/courses/:id` | Yes | Delete course |
| PUT | `/api/videos/:id` | Yes | Update video title/module/order |
| PUT | `/api/progress/:videoId` | Yes | Upsert watched/progress |
| GET | `/api/progress/course/:courseId` | Yes | Course progress, unused by client |
| POST | `/api/modules/course/:courseId` | Yes | Create module, unused |
| PUT | `/api/modules/:id` | Yes | Update module, unused |
| DELETE | `/api/modules/:id` | Yes | Delete module, unused |
| PUT | `/api/modules/course/:courseId/reorder` | Yes | Bulk reorder videos, unused |
| GET/POST | `/api/notes/:videoId/notes` | Yes | Read/save notes |
| GET/POST | `/api/notes/:videoId/bookmarks` | Yes | Read/create bookmarks |
| DELETE | `/api/notes/bookmarks/:id` | Yes | Delete bookmark |
| POST | `/api/ai/generate-description` | Yes | AI course description |
| POST | `/api/ai/generate-chapters` | Yes | AI chapter suggestions |
| POST | `/api/ai/apply-chapters` | Yes | Apply AI chapters |
| POST | `/api/ai/reorder-videos` | Yes | AI reorder videos, unused |
| GET | `/api/streaks` | Yes | Current streak/history |
| POST | `/api/streaks/activity` | Yes | Manual activity record, unused |
| POST | `/api/quizzes/generate/:videoId` | Yes | Generate quiz |
| GET | `/api/quizzes/:videoId` | Yes | Latest quiz + attempts |
| POST | `/api/quizzes/:quizId/submit` | Yes | Submit quiz |
| POST | `/api/summaries/:videoId/generate` | Yes | Generate summary |
| GET | `/api/summaries/:videoId` | Yes | Get summary |
| POST | `/api/chat/:videoId` | Yes | Send AI tutor message |
| GET | `/api/chat/:videoId` | Yes | Chat history |
| GET/POST/DELETE | `/api/tags...` | Yes | Tag CRUD and course tagging |
| GET/PUT | `/api/profile` | Yes | Profile and preferences |
| GET | `/api/certificates/public/:uid` | No | Public certificate JSON |
| GET | `/api/certificates/:courseId` | Yes | Get user certificate |
| POST | `/api/certificates/:courseId/generate` | Yes | Generate certificate |

## 6. Production Readiness Audit

Environment variables:

- Client: `VITE_CLERK_PUBLISHABLE_KEY` required and hard-fails in `client/src/App.jsx:34`; `VITE_API_URL` defaults to localhost in `client/src/lib/api.js:4`.
- Server: `DATABASE_URL` hard-fails in `server/src/db/index.js:3`. `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `AI_RATE_LIMIT_MAX`, `CLIENT_URL`, `PORT` are expected.
- `AI_RATE_LIMIT_MAX` is not defaulted; `Number(undefined)` is passed to rate limit config: `server/src/index.js:46`.

Error handling:

- Most controllers use `try/catch(next)` and global error middleware exists: `server/src/index.js:121`.
- Missing transaction handling in multi-step writes: course import and AI chapter apply.
- Frontend often swallows exact errors and shows generic AI-busy messages: `client/src/pages/CourseSettings.jsx:117`.

Security issues:

- Critical: unauthenticated `/api/auth/sync` lets a caller upsert arbitrary Clerk IDs/emails: `server/src/routes/auth.js:63`.
- Critical: progress/notes/bookmarks can attach user data to videos without checking course ownership: `server/src/controllers/progress.js:8`, `server/src/controllers/notes.js:8`, `server/src/controllers/bookmarks.js:8`.
- High: `deleteModule` mutates videos before authorization check: `server/src/controllers/modules.js:60`.
- High: certificate print window injects unescaped `display_name`, `email`, and `course_title` into raw HTML: `client/src/components/CertificateModal.jsx:109`.
- Medium: `untagCourse` deletes mappings without verifying tag/course ownership: `server/src/controllers/tags.js:85`.
- Medium: `getSummary` does not verify video ownership: `server/src/controllers/summaries.js:45`.
- Medium: CORS only supports one exact `CLIENT_URL`; production preview/multiple origins are not handled: `server/src/index.js:29`.

Known bugs:

- Client lint fails because `client/make-circle.js` uses CommonJS globals in an ESM/browser ESLint config: `client/make-circle.js:1`.
- Public certificate share URL is wrong for separate frontend/backend deployments: `client/src/components/CertificateModal.jsx:13`.
- `server/test_db.js` is destructive and broken: `server/test_db.js:6`.
- AI model list contains invalid-looking model IDs: `gemini-3.1-flash-lite`, `gemini-3.5-flash` in `server/src/services/gemini.js:11`.

TODO/FIXME/HACK:

- None found with `rg "TODO|FIXME|HACK|XXX"` excluding `node_modules` and lockfiles.

Verification:

- `npm run build --prefix client`: passes after sandbox escalation.
- `npm run lint --prefix client`: fails with 4 errors in `client/make-circle.js`.
- Server JS syntax check: passes.
- No backend tests or integration tests exist.

## 7. Dependencies

Key packages:

- `@clerk/react`, `@clerk/express`, `svix`: authentication and webhooks.
- `@neondatabase/serverless`: Postgres access.
- `express`, `cors`, `express-rate-limit`: API server, CORS, throttling.
- `@tanstack/react-query`, `axios`: client API/cache layer.
- `@dnd-kit/*`: drag/drop video ordering.
- `tailwindcss`, `@tailwindcss/vite`: styling.
- `lucide-react`: icons.
- `@vercel/analytics`, `@vercel/speed-insights`: frontend telemetry.

Outdated packages from `npm outdated`:

- Client: Clerk React, Tailwind/Vite plugin, React Query, Axios, React/React DOM, React Router, Vite, ESLint stack, lucide.
- Server: Clerk Express, Neon serverless, dotenv, Express, express-rate-limit, Svix.
- Major upgrade risks: Express 4 -> 5, Vite 7 -> 8, ESLint 9 -> 10, lucide `0.x` -> `1.x`, Neon `0.10` -> `1.1`.

Unused/conflicting:

- `client/make-circle.js` duplicates `make-circle.cjs` and breaks lint.
- `server/test_db.js` should not be in a production repo unless clearly isolated.
- Module CRUD and some AI/streak/progress endpoints appear unused by the current frontend.

## 8. What The Developer Likely Doesn't Fully Understand

- The AI features are based on video titles/descriptions, not transcripts or actual video content. Interview claims should not imply deep video understanding.
- Clerk auth is not complete just because the frontend has tokens. The backend must validate identity for `/auth/sync`; right now it trusts client-supplied IDs.
- SQL template literals are parameterized, but authorization is still manual. Several endpoints are injection-safe but access-control unsafe.
- Multi-step database writes need transactions. Course import and chapter apply can leave inconsistent partial state.
- Webhook verification needs raw request bodies. Parsing JSON first can invalidate signature verification.
- Gemini model IDs and endpoint compatibility are brittle; hardcoded fallbacks need to match official model names.

## 9. Interview Readiness Gaps

Likely interview questions:

- Why use REST + raw SQL instead of ORM/schema tooling?
- How does Clerk identity map to local users, and how is that protected?
- What happens if YouTube import fails halfway?
- Why are AI summaries/quizzes generated from metadata instead of transcripts?
- How would you support multi-device progress, per-user time zones, and idempotent activity tracking?
- How would you deploy frontend/backend so certificate share URLs and API URLs work correctly?

Resume-strength gaps:

- Add backend tests for auth ownership and critical mutations.
- Add migration tracking and transaction boundaries.
- Fix auth sync and webhook raw-body verification.
- Add observability around AI/YouTube failures.
- Clarify that the project uses AI-assisted course organization, not true content extraction from videos.

## 10. Immediate Action Items

1. Fix `/api/auth/sync`: require Clerk auth, derive `clerkId/email` from verified token/server Clerk user, not request body.
2. Add ownership checks to progress, notes, bookmarks, summaries GET, chat history, module delete/reorder, video module assignment, and untag.
3. Remove or quarantine `server/test_db.js`; it can wipe a real database.
4. Fix Clerk webhook raw body handling before `express.json()`.
5. Wrap course import and AI chapter application in DB transactions.
6. Fix certificate share URL/deployment model and escape certificate print HTML.
7. Fix lint by removing/ignoring `client/make-circle.js` or converting it properly.
8. Replace invalid Gemini model IDs with official supported model strings.
9. Add migration tracking and correct FK cascade behavior for user deletion.
10. Add tests: auth/ownership integration tests first, then course import failure tests, then client smoke tests.
