import fs from 'fs';
import path from 'path';
import { getPool, query } from './index';

/**
 * Runs the initial SQL migration to set up the tables
 */
export async function runMigration(): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('[MIGRATION] Applying database schema...');
  try {
    await query(sql);
    console.log('[MIGRATION] Schema successfully applied.');
  } catch (error) {
    console.error('[MIGRATION ERROR]', error);
    throw error;
  }
}

// When invoked directly from CLI (npm run migrate)
if (require.main === module || (process.argv[1] && process.argv[1].endsWith('migrate.ts'))) {
  runMigration()
    .then(async () => {
      await getPool().end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await getPool().end();
      process.exit(1);
    });
}
