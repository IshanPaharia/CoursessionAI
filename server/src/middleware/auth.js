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

export async function requireAuth(req, res, next) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      throw new AuthError('Unauthorized', 'UNAUTHENTICATED');
    }

    const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;

    if (rows.length === 0) {
      throw new AuthError('Account setup is incomplete. Please sign out and sign in again.', 'USER_NOT_SYNCED');
    }

    req.userId = rows[0].id;
    req.clerkId = clerkId;
    next();
  } catch (err) {
    next(err);
  }
}
