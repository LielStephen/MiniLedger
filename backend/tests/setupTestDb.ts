import crypto from 'crypto';
import { newDb } from 'pg-mem';
import { setPool, query } from '../src/db';
import { resetOtpRateLimits } from '../src/middleware/rateLimit';

export async function setupTestDatabase(): Promise<void> {
  const db = newDb();

  // Register gen_random_uuid in pg-mem as an impure function so it generates fresh UUIDs
  db.public.registerFunction({
    name: 'gen_random_uuid',
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  const { Pool } = db.adapters.createPg();
  const testPool = new Pool();
  setPool(testPool as any);

  // Apply schema compatible with pg-mem
  await query(`
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_name TEXT NOT NULL,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        due_date DATE NOT NULL,
        is_repaid BOOLEAN NOT NULL DEFAULT FALSE,
        repaid_at TIMESTAMP NULL,
        receipt_url TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  resetOtpRateLimits();
}
