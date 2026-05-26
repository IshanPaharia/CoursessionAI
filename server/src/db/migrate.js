import '../env.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sql from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, 'migrations');

async function migrate() {
  console.log('Running migrations...');

  // Ensure migrations tracking table exists
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Fetch already applied migrations
  const appliedRows = await sql`SELECT name FROM schema_migrations`;
  const appliedSet = new Set(appliedRows.map(r => r.name));

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  Skip ${file} (already applied)`);
      continue;
    }

    const filePath = join(migrationsDir, file);
    const content = readFileSync(filePath, 'utf-8');
    console.log(`  Applying ${file}...`);

    const statements = content
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    // Track applied migration
    await sql`
      INSERT INTO schema_migrations (name)
      VALUES (${file})
    `;

    console.log(`  ✓ ${file} applied`);
  }

  console.log('All migrations completed.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
