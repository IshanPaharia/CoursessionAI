import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const rawSql = neon(process.env.DATABASE_URL);

// Wrap SQL execution with retries to handle Neon DB cold starts/timeouts
const sql = async (strings, ...values) => {
  let retries = 3;
  let delay = 1500;

  while (retries > 0) {
    try {
      return await rawSql(strings, ...values);
    } catch (error) {
      if (
        error.message?.includes('fetch failed') || 
        error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error.message?.includes('timeout')
      ) {
        retries--;
        if (retries === 0) throw error;
        
        console.warn(`Neon DB connection timeout (likely cold boot). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff: 1.5s -> 2.25s -> 3.3s
      } else {
        throw error;
      }
    }
  }
};

export default sql;
