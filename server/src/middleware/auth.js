import { clerkMiddleware, getAuth } from '@clerk/express';
import sql from '../db/index.js';

export const clerkAuth = clerkMiddleware();

export async function requireAuth(req, res, next) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Please complete sign-up.' });
    }

    req.userId = rows[0].id;
    req.clerkId = clerkId;
    next();
  } catch (err) {
    next(err);
  }
}
