import { pool } from "@workspace/db";
import { logger } from "./lib/logger";

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS snippets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'plain',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    logger.info("Database migration complete");
  } catch (err) {
    logger.error({ err }, "Database migration failed");
    throw err;
  } finally {
    client.release();
  }
}
