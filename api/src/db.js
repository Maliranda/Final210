import pg from 'pg';

export const pool = new pg.Pool({
  max: 5,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'idle database client failed',
    detail: err.message,
  }));
});

const DDL = `
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  mastery_level SMALLINT NOT NULL DEFAULT 1 CHECK (mastery_level IN (1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function migrate(db = pool) {
  const attempts = Number(process.env.MIGRATE_ATTEMPTS || 30);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await db.query(DDL);
      return;
    } catch (err) {
      lastError = err;
      console.log(JSON.stringify({
        level: 'warn',
        message: 'database not ready',
        attempt,
      }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
}
