import { create } from 'zustand';
import type {
  AppState, VocabularyWord, WordList, PracticeSession, MasteryLevel, MasteryCategory,
} from '../types';

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

export const UNDEFINED_LIST_ID = '__undefined__'
export const UNDEFINED_LIST_NAME = 'undefined'

export interface VocabularyStoreState extends AppState {
  loading: boolean;
  error: string | null;
}

type VocabularyStoreActions = {
  addWord: (term: string, definition: string, opts?: { listId?: string | null; exampleSentence?: string; masteryLevel?: MasteryLevel }) => void;
  deleteWord: (wordId: string) => void;
  addList: (name: string, description?: string) => WordList;
  updateList: (listId: string, updates: Partial<Pick<WordList, 'name' | 'description'>>) => void;
  deleteList: (listId: string) => void;
  updateWord: (wordId: string, updates: Partial<Pick<VocabularyWord, 'term' | 'definition' | 'exampleSentence' | 'listId'>>) => void;
  setCurrentListFilter: (listId: string | null) => void;
  setMasteryFilter: (category: MasteryCategory | null) => void;
  updateWordMastery: (wordId: string, level: MasteryLevel) => void;
  recordPracticeSession: (session: PracticeSession) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  replaceState: (state: AppState) => void;
};

const mapWord = (words: VocabularyWord[], id: string, patch: Partial<VocabularyWord>) =>
  words.map((w) => (w.id === id ? { ...w, ...patch, updatedAt: now() } : w));

function ensureUndefinedList(lists: WordList[]): WordList[] {
  if (lists.some((l) => l.id === UNDEFINED_LIST_ID)) return lists
  const sys: WordList = { id: UNDEFINED_LIST_ID, name: UNDEFINED_LIST_NAME, createdAt: now(), updatedAt: now() }
  return [sys, ...lists]
}

function normalizeIncomingState(state: AppState): AppState {
  const lists = ensureUndefinedList(state.lists)
  const words = state.words.map((w) => (w.listId == null ? { ...w, listId: UNDEFINED_LIST_ID } : w))
  return { ...state, lists, words }
}

export const useVocabularyStore = create<VocabularyStoreState & VocabularyStoreActions>(
  (set) => ({
    words: [],
    lists: ensureUndefinedList([]),
    sessions: [],
    currentListFilter: null, masteryFilter: null,
    loading: false, error: null,

    addWord: (term, definition, opts) => {
      const word: VocabularyWord = {
        id: uuid(), term, definition,
        exampleSentence: opts?.exampleSentence,
        masteryLevel: opts?.masteryLevel ?? 1,
        listId: opts?.listId ?? UNDEFINED_LIST_ID,
        lastPracticedAt: null,
        createdAt: now(), updatedAt: now(),
      };
      set((s) => ({ words: [...s.words, word] }));
    },

    deleteWord: (wordId) =>
      set((s) => ({ words: s.words.filter((w) => w.id !== wordId) })),

    addList: (name, description) => {
      const list: WordList = { id: uuid(), name, description, createdAt: now(), updatedAt: now() };
      set((s) => ({ lists: [...ensureUndefinedList(s.lists), list] }));
      return list;
    },

    updateList: (listId, updates) =>
      set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, ...updates, updatedAt: now() } : l)) })),

    deleteList: (listId) =>
      set((s) => {
        if (listId === UNDEFINED_LIST_ID) return { lists: ensureUndefinedList(s.lists), words: s.words }
        return {
          lists: ensureUndefinedList(s.lists.filter((l) => l.id !== listId)),
          words: s.words.map((w) => (w.listId === listId ? { ...w, listId: UNDEFINED_LIST_ID, updatedAt: now() } : w)),
        }
      }),

    updateWord: (wordId, updates) =>
      set((s) => ({ words: mapWord(s.words, wordId, updates) })),

    setCurrentListFilter: (listId) => set({ currentListFilter: listId }),
    setMasteryFilter: (category) => set({ masteryFilter: category }),

    updateWordMastery: (wordId, level) =>
      set((s) => ({ words: mapWord(s.words, wordId, { masteryLevel: level }) })),

    recordPracticeSession: (session) =>
      set((s) => ({ sessions: [...s.sessions, session] })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    replaceState: (state) => set(normalizeIncomingState(state)),
  })
);

export function getStoreDomainState(): AppState {
  const { words, lists, sessions, currentListFilter, masteryFilter } = useVocabularyStore.getState();
  return { words, lists, sessions, currentListFilter, masteryFilter };
}
