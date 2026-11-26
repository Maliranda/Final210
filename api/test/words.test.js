import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { migrate, pool } from '../src/db.js';

describe('words API', { concurrency: false }, () => {
  let app;

  before(async () => {
    process.env.MIGRATE_ATTEMPTS = '8';
    await migrate();
    app = createApp(pool);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE words');
  });

  after(async () => {
    await pool.end();
  });

  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/words');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.words, []);
  });

  it('adds a word and lists it', async () => {
    const created = await request(app)
      .post('/api/words')
      .send({ term: 'ephemeral', definition: 'lasting for a short time' });
    assert.equal(created.status, 201);
    assert.equal(created.body.word.term, 'ephemeral');
    assert.equal(created.body.word.masteryLevel, 1);

    const listed = await request(app).get('/api/words');
    assert.equal(listed.status, 200);
    assert.equal(listed.body.words.length, 1);
    assert.equal(listed.body.words[0].id, created.body.word.id);
  });

  it('rejects an empty term before it is stored', async () => {
    const res = await request(app)
      .post('/api/words')
      .send({ term: '   ', definition: 'should not be saved' });
    assert.equal(res.status, 400);

    const listed = await request(app).get('/api/words');
    assert.equal(listed.body.words.length, 0);
  });

  it('marks a word learned', async () => {
    const created = await request(app)
      .post('/api/words')
      .send({ term: 'lend', definition: 'to give for temporary use' });
    const updated = await request(app)
      .patch(`/api/words/${created.body.word.id}`)
      .send({ masteryLevel: 2 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.word.masteryLevel, 2);
  });

  it('returns 404 when the word does not exist', async () => {
    const res = await request(app)
      .patch('/api/words/00000000-0000-4000-8000-000000000001')
      .send({ masteryLevel: 2 });
    assert.equal(res.status, 404);
  });
});
