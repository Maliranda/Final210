# Agent Instructions — Vocabulary Builder

Use this file when working on the codebase (Claude Code, Cursor, Gemini CLI, GitHub Copilot, etc.).

---

## 1. App Overview

- **Theme:** Vocabulary learning app.
- **Purpose:** Users add vocabulary words with definitions, organize them into lists, and practice with multiple-choice, fill-in-the-blank, and matching modes. Mastery levels (1–5) and practice sessions are tracked. Optional Firebase Auth login and per-user Firestore persistence.
- **Core entities:** `VocabularyWord`, `WordList`, `PracticeSession`. Types live in `src/types.ts`.

---

## 2. State Management Approach

- **Library:** Zustand (v5).
- **Why:** Simple hooks-based API, minimal boilerplate, fits one coherent "vocabulary state" without Redux-level structure. Easy to add `loading`/`error` for async work in Project 5.
- **Store file:** `src/store/vocabularyStore.ts`.
- **Context bridge:** `VocabularyBuilderContext` in `src/context/VocabularyBuilderContext.tsx` reads individual fields from the store via separate selectors (to avoid infinite re-render loops), then exposes the same API so pages keep using `useVocabularyBuilderContext()`.
- **Persistence:** The provider subscribes to the store; on every change it saves domain state to Firestore (per-user path `users/{uid}/vocabulary/appState`). On mount it loads from Firestore and calls `replaceState`.
- **Legacy hook:** `src/hooks/useVocabularyBuilder.ts` — the Project 3 custom hook. Still in the codebase with tests, but the app uses the store via context.

**State categorization (from Project 3 hook):**

| Category     | Examples                    | Tool / location                     |
|--------------|-----------------------------|-------------------------------------|
| UI state     | mastery filter, list filter | Store (shared across pages)         |
| Form state   | term, definition inputs     | Local `useState` in page components |
| Server cache | words, lists, sessions      | Zustand store                       |
| URL state    | routes                      | React Router                        |

---

## 3. State Shape

```ts
// Domain (src/types.ts)
export interface AppState {
  words: VocabularyWord[];
  lists: WordList[];
  sessions: PracticeSession[];
  currentListFilter: string | null;
  masteryFilter: MasteryCategory | null;
}

// Store state extends AppState with async support
export interface VocabularyStoreState extends AppState {
  loading: boolean;
  error: string | null;
}
```

---

## 4. API & Service Conventions

- **Service layer:** `src/services/` — all Firebase/backend operations go through this folder.
- **Files:**
  - `firebase-config.ts` — Firebase initialization and instance getters
  - `auth.ts` — `authService` with `signIn`, `signUp`, `signOut`, `onAuthStateChanged`
  - `api.ts` — `vocabularyApi` with `loadState`, `saveState` (real Firestore persistence)
- **Rule:** Components and contexts import **only from `src/services/`**, never from Firebase SDK directly.
- **Interface:** `IVocabularyApi` — `loadState`, `saveState`, `getWords`, `addWord`, etc.
- **Persistence:** `loadState(userId)` and `saveState(state, userId)` use Firestore document at `users/{uid}/vocabulary/appState`.

---

## 5. File Structure

```
src/
├── components/
│   └── ui/              # Reusable UI abstractions (MUI wrappers)
├── context/             # React contexts (VocabularyBuilderContext, AuthContext)
├── hooks/               # Custom hooks (useVocabularyBuilder) + tests
├── lib/                 # Legacy: IVocabularyRepository interface (used by Project 3 hook)
├── pages/               # Pages — composition of UI components and hooks
├── services/            # ALL backend operations: firebase-config.ts, auth.ts, api.ts
├── store/               # Zustand store (vocabularyStore.ts)
├── test/                # Test setup (Vitest)
├── types.ts
├── App.tsx
├── ErrorBoundary.tsx
├── main.tsx
└── index.css
```

| Path / pattern                              | Purpose |
|---------------------------------------------|---------|
| `src/types.ts`                              | Domain types |
| `src/store/vocabularyStore.ts`              | Zustand store: state + actions |
| `src/context/VocabularyBuilderContext.tsx`   | Provider that bridges store ↔ pages, wires persistence |
| `src/context/AuthContext.tsx`               | Firebase Auth provider (user, loading, signOut) |
| `src/services/firebase-config.ts`           | Firebase initialization and instance getters |
| `src/services/auth.ts`                      | Auth service: signIn, signUp, signOut |
| `src/services/api.ts`                       | `IVocabularyApi` with real Firestore persistence |
| `src/hooks/useVocabularyBuilder.ts`         | Project 3 custom hook (kept for grading) |
| `src/hooks/useVocabularyBuilder.test.ts`    | Tests for the hook |
| `src/pages/HomePage.tsx`                    | Landing page with stats and links |
| `src/pages/VocabularyPage.tsx`              | Add/edit/delete words and lists |
| `src/pages/PracticePage.tsx`                | Multiple choice, fill-in-the-blank, matching |
| `src/pages/SettingsPage.tsx`                | User settings and account info |
| `src/pages/AboutPage.tsx`                   | App information and tech stack |
| `src/pages/LoginPage.tsx`                   | Sign in / sign up (Firebase Auth) |
| `src/components/ui/*`                       | Reusable UI components (MUI wrappers) |
| `src/lib/vocabularyRepository.ts`           | Legacy: IVocabularyRepository interface (Project 3 hook) |
| `src/ErrorBoundary.tsx`                     | Catches render errors |

Naming: Components PascalCase; hooks `use*`; store `*Store.ts`; services `api.ts`.

---

## 6. Adding New Features

1. **Types** — `src/types.ts`: add or extend types.
2. **Store** — `src/store/vocabularyStore.ts`: add action to the store.
3. **API** — `src/services/api.ts`: add method to `IVocabularyApi` + placeholder.
4. **Context** — `src/context/VocabularyBuilderContext.tsx`: expose new action via selector + value object.
5. **UI** — In the relevant page, destructure from `useVocabularyBuilderContext()` and wire buttons/handlers.

Example (add "archive word"): add `archived: boolean` to `VocabularyWord`; add `archiveWord(wordId)` in the store; add to `IVocabularyApi`; expose from context; add button in VocabularyPage.

---

## 7. Coding Rules

- **TypeScript** — Strict mode. All files `.ts` / `.tsx`. No `any` without good reason.
- **Step-down rule** — Pages (`src/pages/`) compose only UI abstractions from `src/components/ui/`. No raw HTML tags (`<div>`, `<button>`, `<input>`, `<form>`, `<ul>`, `<li>`, `<h1>`, `<p>`, `<a>`, `<section>`, `<label>`, `<select>`, `<option>`) and no CSS class names in page JSX. When adding new behaviour or look: first add or extend the UI component, then use it on the page.
- **Reusability** — UI components must not depend on the business domain (words, lists). Pages and contexts bind the domain to the UI.
- **Immutability** — All state updates via new object/array copies; no mutations.
- **Persistence** — CRUD operations are persisted via Firestore. Persistence logic lives in `src/lib/`, never inside page components.
- **Tests** — Custom hooks must have tests (Vitest + `@testing-library/react`). Cover main operations and at least one edge case.

| Allowed | Disallowed |
|---------|------------|
| Use only components from `components/ui/` in pages | Raw HTML and class names in page components |
| Keep styles in CSS files or the UI library theme | Inline styles and duplicated markup in pages |
| Add new logic via hooks and repositories in `lib/` | Persistence logic inside page components |
| Extend the UI set with new abstractions | New pages with "temporary" markup and no UI components |

---

## 8. Pre-commit Checks

- `npm run test` — All tests pass.
- `npx tsc --noEmit` — No TypeScript errors.
- Pages must not contain raw HTML tags — only components from `src/components/ui/`.

---

## 9. Backend (Project 5)

- **Choice:** Firebase (Firestore + Auth).
- **Why:** Zero-config BaaS, free tier sufficient, real-time sync built-in, integrates auth and database in one SDK.
- **Configuration:** Environment variables in `.env` (not committed):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- **Persistence layer:** `src/services/api.ts` — `vocabularyApi.loadState(userId)` and `vocabularyApi.saveState(state, userId)`. Creates per-user document at `users/{uid}/vocabulary/appState`.
- **Async states:** Context sets `loading: true` before load, `loading: false` after. On error, sets `error` message. Pages can read `state.loading` and `state.error` from context.

---

## 10. Authentication (Project 5)

- **Choice:** Firebase Auth (email/password).
- **Why:** Integrated with Firestore, handles sessions automatically, secure by default.
- **Flow:**
  1. App checks `isFirebaseConfigured()` — if false, runs without auth (local-only mode).
  2. If configured, `AuthProvider` listens to `onAuthStateChanged`.
  3. If no user, shows `LoginPage` (sign in / sign up forms).
  4. After auth, `VocabularyBuilderProvider` uses `userId` to scope Firestore document.
  5. Sign out button in nav calls `auth.signOut()`.
- **Protected routes:** All routes except `/login` require authentication when Firebase is configured.
- **Files:**
  - `src/services/firebase-config.ts` — Firebase initialization
  - `src/services/auth.ts` — `authService` with signIn, signUp, signOut
  - `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth()` (uses authService)
  - `src/pages/LoginPage.tsx` — sign in / sign up UI (uses authService)
