import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const rawSql = neon(process.env.DATABASE_URL);

// Wrap SQL execution with a 1-time retry to handle Neon DB cold starts/timeouts
const sql = async (strings, ...values) => {
  try {
    return await rawSql(strings, ...values);
  } catch (error) {
    if (
      error.message?.includes('fetch failed') || 
      error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      error.message?.includes('timeout')
    ) {
      console.warn('Neon DB connection timeout (likely cold boot). Retrying in 1.5s...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return await rawSql(strings, ...values);
    }
    throw error;
  }
};

export default sql;
