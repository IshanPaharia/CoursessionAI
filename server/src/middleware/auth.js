import { clerkMiddleware, getAuth } from '@clerk/express';
import sql from '../db/index.js';

export const clerkAuth = clerkMiddleware();

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
    this.code = code;
  }
}

// Cache user lookups to avoid hitting the DB on every single request
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function requireAuth(req, res, next) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      throw new AuthError('Unauthorized', 'UNAUTHENTICATED');
    }

    // Check cache first
    const cached = userCache.get(clerkId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      req.userId = cached.id;
      req.clerkId = clerkId;
      return next();
    }

    const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;

    if (rows.length === 0) {
      throw new AuthError('Account setup is incomplete. Please sign out and sign in again.', 'USER_NOT_SYNCED');
    }

    userCache.set(clerkId, { id: rows[0].id, ts: Date.now() });
    req.userId = rows[0].id;
    req.clerkId = clerkId;
    next();
  } catch (err) {
    next(err);
  }
}

