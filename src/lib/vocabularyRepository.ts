import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { AppState } from '../types'

const APP_STATE_DOC_ID = 'appState'

export interface IVocabularyRepository {
  load(): Promise<AppState>
  save(state: AppState): Promise<void>
}

function normalizeMastery(level: number): 1 | 2 {
  return level >= 2 ? 2 : 1
}

function parseState(data: unknown): AppState {
  if (data == null || typeof data !== 'object') {
    return {
      words: [],
      lists: [],
      sessions: [],
      currentListFilter: null,
      masteryFilter: null,
    }
  }
  const o = data as Record<string, unknown>
  const rawWords = Array.isArray(o.words) ? (o.words as Array<{ masteryLevel?: number }>) : []
  const words = rawWords.map((w) => ({ ...w, masteryLevel: normalizeMastery(w.masteryLevel ?? 1) })) as AppState['words']
  const rawFilter = o.masteryFilter
  const masteryFilter =
    typeof rawFilter === 'string' && (rawFilter === 'new' || rawFilter === 'learned')
      ? (rawFilter as AppState['masteryFilter'])
      : typeof rawFilter === 'string' && ['learning', 'familiar', 'mastered'].includes(rawFilter)
        ? ('learned' as AppState['masteryFilter'])
        : null
  return {
    words,
    lists: Array.isArray(o.lists) ? o.lists as AppState['lists'] : [],
    sessions: Array.isArray(o.sessions) ? o.sessions as AppState['sessions'] : [],
    currentListFilter: typeof o.currentListFilter === 'string' ? o.currentListFilter : null,
    masteryFilter,
  }
}

function stripUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(stripUndefined) as T
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) out[k] = typeof v === 'object' && v !== null ? stripUndefined(v) : v
  }
  return out as T
}

/**
 * @param userId - If set, data is stored per user (users/{userId}/vocabulary/appState). Otherwise one global doc.
 */
export function createFirebaseVocabularyRepository(
  db: Firestore,
  collectionName = 'vocabulary',
  userId?: string | null
): IVocabularyRepository {
  const ref = userId
    ? doc(db, 'users', userId, 'vocabulary', APP_STATE_DOC_ID)
    : doc(db, collectionName, APP_STATE_DOC_ID)
  return {
    async load() {
      const snap = await getDoc(ref)
      const data = snap.exists() ? snap.data() : null
      return parseState(data)
    },
    async save(state: AppState) {
      await setDoc(ref, stripUndefined(state))
    },
  }
}
