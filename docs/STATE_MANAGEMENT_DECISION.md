# State Management Decision (Project 4)

## Step 1: Categorization of State (from Project 3 Hook)

| Category     | Examples from our app              | Typical tool / location        |
|-------------|-------------------------------------|-------------------------------|
| UI state    | `currentListFilter`, `masteryFilter`| Store (shared across pages)   |
| Form state  | term, definition, listName inputs   | Local `useState` in pages     |
| Server cache| words, lists, sessions             | Store (Zustand)               |
| URL state   | Routes (/vocabulary, /practice)     | React Router                  |

We applied the decision framework: form state stays local; URL state stays in React Router; shared data that mirrors the backend (words, lists, sessions) and shared UI filters belong in a global store.

## Chosen Library: Zustand

- **Why not Context + useReducer:** Already used in Project 3 via a custom hook + context. We wanted a dedicated store with minimal boilerplate and a single source of truth that scales to async (loading/error) in Project 5.
- **Why not Redux Toolkit:** No need for middleware or heavy structure for this app size.
- **Why not Jotai:** Atoms are a good fit for fine-grained updates, but we have one coherent “vocabulary state” blob; Zustand’s single store is simpler to reason about and to persist (load/save one state object).
- **Why Zustand:** Simple, hooks-based API, minimal boilerplate, easy to add `loading` and `error` to the store for Project 5. Store lives in `src/store/vocabularyStore.ts` and is consumed via `VocabularyBuilderContext` so existing pages keep using `useVocabularyBuilderContext()`.

## Store Location and Shape

- **Store file:** `src/store/vocabularyStore.ts`
- **State type:** `VocabularyStoreState` extends `AppState` with `loading: boolean` and `error: string | null` (see AGENTS.md § State Shape).
