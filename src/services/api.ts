import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirestoreInstance, isFirebaseConfigured } from './firebase-config'
import type { AppState, VocabularyWord, WordList, PracticeSession } from '../types'

const APP_STATE_DOC_ID = 'appState'

function normalizeMastery(level: number): 1 | 2 {
  return level >= 2 ? 2 : 1
}

function parseState(data: unknown): AppState {
  if (data == null || typeof data !== 'object') {
    return { words: [], lists: [], sessions: [], currentListFilter: null, masteryFilter: null }
  }
  const o = data as Record<string, unknown>
  const rawWords = Array.isArray(o.words) ? (o.words as Array<VocabularyWord & { masteryLevel?: number }>) : []
  const words = rawWords.map((w) => ({ ...w, masteryLevel: normalizeMastery(w.masteryLevel ?? 1) })) as AppState['words']
  const rawFilter = o.masteryFilter
  const masteryFilter =
    typeof rawFilter === 'string' && (rawFilter === 'new' || rawFilter === 'learned')
      ? rawFilter as AppState['masteryFilter']
      : typeof rawFilter === 'string' && ['learning', 'familiar', 'mastered'].includes(rawFilter)
        ? 'learned' as AppState['masteryFilter']
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

export interface IVocabularyApi {
  isConfigured(): boolean
  loadState(userId?: string | null): Promise<AppState>
  saveState(state: AppState, userId?: string | null): Promise<void>
  getWords(): Promise<VocabularyWord[]>
  addWord(word: Omit<VocabularyWord, 'id' | 'createdAt' | 'updatedAt' | 'lastPracticedAt'>): Promise<VocabularyWord>
  updateWord(id: string, updates: Partial<Pick<VocabularyWord, 'term' | 'definition' | 'exampleSentence' | 'listId' | 'masteryLevel'>>): Promise<VocabularyWord | null>
  deleteWord(id: string): Promise<boolean>
  getLists(): Promise<WordList[]>
  addList(list: Omit<WordList, 'id' | 'createdAt' | 'updatedAt'>): Promise<WordList>
  getSessions(): Promise<PracticeSession[]>
  recordSession(session: PracticeSession): Promise<PracticeSession>
}

const now = () => new Date().toISOString()
const uuid = () => crypto.randomUUID()

export const vocabularyApi: IVocabularyApi = {
  isConfigured() {
    return isFirebaseConfigured()
  },

  async loadState(userId?: string | null): Promise<AppState> {
    const db = getFirestoreInstance()
    if (!db) return { words: [], lists: [], sessions: [], currentListFilter: null, masteryFilter: null }

    const ref = userId
      ? doc(db, 'users', userId, 'vocabulary', APP_STATE_DOC_ID)
      : doc(db, 'vocabulary', APP_STATE_DOC_ID)

    const snap = await getDoc(ref)
    return parseState(snap.exists() ? snap.data() : null)
  },

  async saveState(state: AppState, userId?: string | null): Promise<void> {
    const db = getFirestoreInstance()
    if (!db) return

    const ref = userId
      ? doc(db, 'users', userId, 'vocabulary', APP_STATE_DOC_ID)
      : doc(db, 'vocabulary', APP_STATE_DOC_ID)

    await setDoc(ref, stripUndefined(state))
  },

  async getWords(): Promise<VocabularyWord[]> { return [] },

  async addWord(word) {
    return { ...word, id: uuid(), lastPracticedAt: null, createdAt: now(), updatedAt: now() }
  },

  async updateWord(): Promise<VocabularyWord | null> { return null },
  async deleteWord(): Promise<boolean> { return true },
  async getLists(): Promise<WordList[]> { return [] },

  async addList(list) {
    return { ...list, id: uuid(), createdAt: now(), updatedAt: now() }
  },

  async getSessions(): Promise<PracticeSession[]> { return [] },
  async recordSession(session) { return session },
}
