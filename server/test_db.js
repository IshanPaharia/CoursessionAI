import 'dotenv/config';
import sql from './src/db/index.js';

async function test() {
  try {
    const rows = await sql`
      INSERT INTO users (clerk_id, email) 
      VALUES ('test_id', 'test@example.com') 
      ON CONFLICT (clerk_id) 
      DO UPDATE SET email = 'test@example.com' 
      RETURNING id
    `;
    console.log('SUCCESS:', rows);
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    process.exit(0);
  }
}
test();
