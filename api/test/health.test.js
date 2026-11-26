import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

function fakeDb(query) {
  return { query };
}

describe('health', () => {
  it('answers liveness without touching the database', async () => {
    const app = createApp(fakeDb(async () => {
      throw new Error('database should not be called');
    }));
    const res = await request(app).get('/health/live');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  it('reports ready when the database answers', async () => {
    const app = createApp(fakeDb(async () => ({ rows: [{ '?column?': 1 }] })));
    const res = await request(app).get('/health/ready');
    assert.equal(res.status, 200);
  });

  it('rejects invalid JSON', async () => {
    const app = createApp(fakeDb(async () => ({ rows: [] })));
    const res = await request(app)
      .post('/api/words')
      .set('Content-Type', 'application/json')
      .send('{');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid JSON');
  });

  it('reports not ready when the database is down', async () => {
    const app = createApp(fakeDb(async () => {
      throw new Error('connection refused');
    }));
    const res = await request(app).get('/health');
    assert.equal(res.status, 503);
    assert.equal(res.body.status, 'unavailable');
  });
});
