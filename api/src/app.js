import { randomUUID } from 'node:crypto';
import express from 'express';
import { validateMastery, validateWordInput } from './validate.js';

function rowToWord(row) {
  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    masteryLevel: Number(row.mastery_level),
    createdAt: row.created_at,
  };
}

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      console.log(JSON.stringify({
        level: 'info',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - started,
      }));
    });
    next();
  });

  app.get('/', (_req, res) => {
    res.json({
      service: 'vocabulary-builder',
      version: process.env.APP_VERSION || 'dev',
      operations: ['list words', 'add word', 'update mastery'],
    });
  });

  app.get('/health/live', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/ready', async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.get('/health', async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ok', version: process.env.APP_VERSION || 'dev' });
    } catch {
      res.status(503).json({ status: 'unavailable', version: process.env.APP_VERSION || 'dev' });
    }
  });

  app.get('/api/words', async (_req, res, next) => {
    try {
      const result = await db.query(
        `SELECT id, term, definition, mastery_level, created_at
         FROM words
         ORDER BY created_at ASC`,
      );
      res.json({ words: result.rows.map(rowToWord) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/words', async (req, res, next) => {
    const parsed = validateWordInput(req.body);

    try {
      const result = await db.query(
        `INSERT INTO words (id, term, definition, mastery_level)
         VALUES ($1, $2, $3, 1)
         RETURNING id, term, definition, mastery_level, created_at`,
        [randomUUID(), parsed.value.term, parsed.value.definition],
      );
      res.status(201).json({ word: rowToWord(result.rows[0]) });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/words/:id', async (req, res, next) => {
    const parsed = validateMastery(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
      res.status(400).json({ error: 'Invalid word id' });
      return;
    }

    try {
      const result = await db.query(
        `UPDATE words
         SET mastery_level = $1
         WHERE id = $2
         RETURNING id, term, definition, mastery_level, created_at`,
        [parsed.value, req.params.id],
      );
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Word not found' });
        return;
      }
      res.json({ word: rowToWord(result.rows[0]) });
    } catch (err) {
      next(err);
    }
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && Object.hasOwn(err, 'body')) {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
    console.error(JSON.stringify({ level: 'error', message: err.message }));
    res.status(500).json({ error: 'Internal error' });
  });

  return app;
}
