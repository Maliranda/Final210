import { create } from 'zustand';
import type {
  AppState, VocabularyWord, WordList, PracticeSession, MasteryLevel, MasteryCategory,
} from '../types';

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

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

export const useVocabularyStore = create<VocabularyStoreState & VocabularyStoreActions>(
  (set) => ({
    words: [], lists: [], sessions: [],
    currentListFilter: null, masteryFilter: null,
    loading: false, error: null,

    addWord: (term, definition, opts) => {
      const word: VocabularyWord = {
        id: uuid(), term, definition,
        exampleSentence: opts?.exampleSentence,
        masteryLevel: opts?.masteryLevel ?? 1,
        listId: opts?.listId ?? null,
        lastPracticedAt: null,
        createdAt: now(), updatedAt: now(),
      };
      set((s) => ({ words: [...s.words, word] }));
    },

    deleteWord: (wordId) =>
      set((s) => ({ words: s.words.filter((w) => w.id !== wordId) })),

    addList: (name, description) => {
      const list: WordList = { id: uuid(), name, description, createdAt: now(), updatedAt: now() };
      set((s) => ({ lists: [...s.lists, list] }));
      return list;
    },

    updateList: (listId, updates) =>
      set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, ...updates, updatedAt: now() } : l)) })),

    deleteList: (listId) =>
      set((s) => ({
        lists: s.lists.filter((l) => l.id !== listId),
        words: s.words.map((w) => (w.listId === listId ? { ...w, listId: null, updatedAt: now() } : w)),
      })),

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
    replaceState: (state) => set(state),
  })
);

export function getStoreDomainState(): AppState {
  const { words, lists, sessions, currentListFilter, masteryFilter } = useVocabularyStore.getState();
  return { words, lists, sessions, currentListFilter, masteryFilter };
}
