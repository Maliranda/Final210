const MAX_TERM = 200;
const MAX_DEFINITION = 500;

export function validateWordInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const term = typeof body.term === 'string' ? body.term.trim() : '';
  const definition = typeof body.definition === 'string' ? body.definition.trim() : '';

  if (!term) {
    return { ok: false, error: 'Term is required' };
  }
  if (!definition) {
    return { ok: false, error: 'Definition is required' };
  }
  if (term.length > MAX_TERM) {
    return { ok: false, error: 'Term is too long' };
  }
  if (definition.length > MAX_DEFINITION) {
    return { ok: false, error: 'Definition is too long' };
  }

  return { ok: true, value: { term, definition } };
}

export function validateMastery(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const level = body.masteryLevel;
  if (level !== 1 && level !== 2) {
    return { ok: false, error: 'masteryLevel must be 1 (new) or 2 (learned)' };
  }

  return { ok: true, value: level };
}
