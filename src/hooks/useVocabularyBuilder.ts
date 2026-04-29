import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  AppState,
  VocabularyWord,
  WordList,
  PracticeSession,
  MasteryLevel,
  MasteryCategory,
} from '../types';
import type { IVocabularyRepository } from '../lib/vocabularyRepository';

function now(): string {
  return new Date().toISOString();
}

export type UseVocabularyBuilderOptions = {
  initial?: Partial<AppState>;
  persistence?: IVocabularyRepository;
};

function isOptions(
  arg?: Partial<AppState> | UseVocabularyBuilderOptions
): arg is UseVocabularyBuilderOptions {
  return arg != null && typeof arg === 'object' && 'persistence' in arg;
}

const emptyState: AppState = {
  words: [],
  lists: [],
  sessions: [],
  currentListFilter: null,
  masteryFilter: null,
};

export function useVocabularyBuilder(
  initialOrOptions?: Partial<AppState> | UseVocabularyBuilderOptions
) {
  const initial = isOptions(initialOrOptions) ? initialOrOptions.initial : initialOrOptions;
  const persistence = isOptions(initialOrOptions) ? initialOrOptions.persistence : undefined;

  const [state, setState] = useState<AppState>({
    ...emptyState,
    ...initial,
    words: initial?.words ?? [],
    lists: initial?.lists ?? [],
    sessions: initial?.sessions ?? [],
    currentListFilter: initial?.currentListFilter ?? null,
    masteryFilter: initial?.masteryFilter ?? null,
  });

  const hasLocalMutationRef = useRef(false);

  useEffect(() => {
    if (!persistence?.load) return;
    persistence
      .load()
      .then((loaded) => {
        if (!hasLocalMutationRef.current) {
          setState(loaded);
        }
      })
      .catch((err) => console.error('Failed to load state:', err));
  }, [persistence]);

  const persist = useCallback(
    (next: AppState) => {
      hasLocalMutationRef.current = true;
      persistence?.save(next).catch((err) => console.error('Failed to save state:', err));
    },
    [persistence]
  );

  const addWord = useCallback(
    (
      term: string,
      definition: string,
      options?: {
        listId?: string | null;
        exampleSentence?: string;
        masteryLevel?: MasteryLevel;
      }
    ) => {
      const word: VocabularyWord = {
        id: crypto.randomUUID(),
        term,
        definition,
        exampleSentence: options?.exampleSentence,
        masteryLevel: options?.masteryLevel ?? 1,
        listId: options?.listId ?? null,
        lastPracticedAt: null,
        createdAt: now(),
        updatedAt: now(),
      };
      setState((prev) => {
        const next = { ...prev, words: [...prev.words, word] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateWord = useCallback(
    (
      wordId: string,
      updates: Partial<Pick<VocabularyWord, 'term' | 'definition' | 'exampleSentence' | 'listId'>>
    ) => {
      setState((prev) => {
        const next = {
          ...prev,
          words: prev.words.map((w) =>
            w.id === wordId ? { ...w, ...updates, updatedAt: now() } : w
          ),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const deleteWord = useCallback(
    (wordId: string) => {
      setState((prev) => {
        const next = { ...prev, words: prev.words.filter((w) => w.id !== wordId) };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addList = useCallback(
    (name: string, description?: string) => {
      const list: WordList = {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: now(),
        updatedAt: now(),
      };
      setState((prev) => {
        const next = { ...prev, lists: [...prev.lists, list] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setCurrentListFilter = useCallback(
    (listId: string | null) => {
      setState((prev) => {
        const next = { ...prev, currentListFilter: listId };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setMasteryFilter = useCallback(
    (category: MasteryCategory | null) => {
      setState((prev) => {
        const next = { ...prev, masteryFilter: category };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateWordMastery = useCallback(
    (wordId: string, level: MasteryLevel) => {
      setState((prev) => {
        const next = {
          ...prev,
          words: prev.words.map((w) =>
            w.id === wordId ? { ...w, masteryLevel: level, updatedAt: now() } : w
          ),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const recordPracticeSession = useCallback(
    (session: PracticeSession) => {
      setState((prev) => {
        const next = { ...prev, sessions: [...prev.sessions, session] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return {
    state,
    addWord,
    updateWord,
    deleteWord,
    addList,
    setCurrentListFilter,
    setMasteryFilter,
    updateWordMastery,
    recordPracticeSession,
  };
}
