import { Router } from 'express';
import { Webhook } from 'svix';
import { getAuth } from '@clerk/express';
import sql from '../db/index.js';

const router = Router();

router.post('/callback', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { type, data } = event;

  if (type === 'user.created' || type === 'user.updated') {
    const { id: clerkId, email_addresses } = data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return res.status(400).json({ error: 'No email in webhook data' });
    }

    await sql`
      INSERT INTO users (clerk_id, email)
      VALUES (${clerkId}, ${email})
      ON CONFLICT (clerk_id)
      DO UPDATE SET email = ${email}
    `;
  }

  if (type === 'user.deleted') {
    const { id: clerkId } = data;
    await sql`DELETE FROM users WHERE clerk_id = ${clerkId}`;
  }

  res.json({ received: true });
});

router.post('/sync', async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const { email } = req.body;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' });
    }

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const rows = await sql`
      INSERT INTO users (clerk_id, email)
      VALUES (${clerkId}, ${email})
      ON CONFLICT (clerk_id)
      DO UPDATE SET email = ${email}
      RETURNING id
    `;

    res.json({ userId: rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;
