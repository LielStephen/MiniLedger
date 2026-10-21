import { Pool, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config';

let activePool: Pool = new Pool({
  connectionString: config.databaseUrl,
});

/**
 * Replace active pool instance (used in tests for in-memory or custom pools)
 */
export function setPool(newPool: Pool) {
  activePool = newPool;
}

export function getPool(): Pool {
  return activePool;
}

/**
 * Execute a parameterized SQL query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return activePool.query<T>(text, params);
}
