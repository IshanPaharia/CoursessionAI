import 'dotenv/config';
import sql from './src/db/index.js';

async function test() {
  try {
    await sql`DROP SCHEMA public CASCADE`;
    await sql`CREATE SCHEMA public`;
    console.log('Successfully dropped and recreated public schema.');
    console.log('SUCCESS:', rows);
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    process.exit(0);
  }
}
test();
