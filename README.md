# CoursessionAI

Transform YouTube playlists into interactive course interfaces.

## Project Structure

```
client/   - React + Vite frontend
server/   - Express.js backend API
```

## Setup

1. Copy `.env.example` and create `client/.env` and `server/.env` with your keys
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Run database migrations:
   ```bash
   cd server && npm run migrate
   ```
4. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```
