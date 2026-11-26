import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateMastery, validateWordInput } from '../src/validate.js';

describe('validateWordInput', () => {
  it('trims a usable word', () => {
    const parsed = validateWordInput({ term: '  ephemeral  ', definition: ' lasting a short time ' });
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.value, { term: 'ephemeral', definition: 'lasting a short time' });
  });

  it('rejects an empty term', () => {
    const parsed = validateWordInput({ term: '   ', definition: 'a meaning' });
    assert.equal(parsed.ok, false);
    assert.match(parsed.error, /Term is required/);
  });

  it('rejects a missing definition', () => {
    const parsed = validateWordInput({ term: 'ephemeral' });
    assert.equal(parsed.ok, false);
    assert.match(parsed.error, /Definition is required/);
  });
});

describe('validateMastery', () => {
  it('accepts new and learned', () => {
    assert.equal(validateMastery({ masteryLevel: 1 }).value, 1);
    assert.equal(validateMastery({ masteryLevel: 2 }).value, 2);
  });

  it('rejects any other level', () => {
    const parsed = validateMastery({ masteryLevel: 3 });
    assert.equal(parsed.ok, false);
  });
});
