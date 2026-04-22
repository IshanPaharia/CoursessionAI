import 'dotenv/config';
import sql from './src/db/index.js';

async function test() {
  try {
    const clerkId = 'test_id_var';
    const email = 'testvar@example.com';
    const rows = await sql`
      INSERT INTO users (clerk_id, email) 
      VALUES (${clerkId}, ${email}) 
      ON CONFLICT (clerk_id) 
      DO UPDATE SET email = ${email} 
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
