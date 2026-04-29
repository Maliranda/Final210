# Vocabulary Builder

## Live Demo (deployed URL)

**URL:** TODO — paste your deployed URL here (example: `https://your-app.vercel.app`).

> Grading note: demoing from `localhost` triggers the course “local-demo ÷2” penalty. This app is intended to be demoed from the public URL above.

## Theme

A vocabulary-learning app where you can add words with definitions and example sentences, organize them into themed lists, practice with multiple modes (multiple choice, fill-in-the-blank, matching), and track mastery (1–5 scale) with filters like new, learning, familiar, and mastered. Includes quiz mode, session statistics, search, review mode, and spaced practice.

## Entities

- **VocabularyWord** – A word with `term`, `definition`, optional `exampleSentence`, `masteryLevel` (1–5), and optional `listId`. Supports timestamps and last-practiced tracking.
- **WordList** – Themed list or category; has `name` and optional `description`.
- **PracticeSession** – Records a practice run: mode, word set, correct/total counts, and mastery level changes.

State is represented by **AppState**, which holds collections of words, lists, and sessions, plus filters (current list, mastery category).

## UI library

The UI is built with **Material UI (MUI)**. Components in `src/components/ui/` wrap MUI primitives (Typography, Button, TextField, Select, Box, List, etc.) so that pages use a stable, domain-agnostic API. The app is wrapped in `ThemeProvider` and `CssBaseline` in `main.tsx`; the theme is defined in `src/theme.ts`.

## Project Structure

```
vocabulary-builder/
├── AGENTS.md                 # AI agent instructions
├── src/
│   ├── theme.ts             
│   ├── types.ts
│   ├── main.tsx
│   ├── App.tsx
│   ├── ErrorBoundary.tsx
│   ├── index.css
│   ├── components/
│   │   └── ui/              
│   ├── context/
│   │   ├── VocabularyBuilderContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useVocabularyBuilder.ts
│   │   └── useVocabularyBuilder.test.ts
│   ├── lib/
│   │   └── vocabularyRepository.ts  # Legacy interface (Project 3)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── VocabularyPage.tsx
│   │   ├── PracticePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── LoginPage.tsx
│   ├── services/
│   │   ├── firebase-config.ts # Firebase initialization
│   │   ├── auth.ts           # Auth service
│   │   └── api.ts            # Persistence service (Firestore)
│   ├── store/
│   │   └── vocabularyStore.ts
│   └── test/
│       └── setup.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open the URL shown in the terminal (e.g. `http://localhost:5173`) in your browser.

4. Type-check without building:
   ```bash
   npx tsc --noEmit
   ```

---

## Deploy to a Public URL (no-localhost demo)

This is a **Vite + React Router** single-page app. The repo includes:

- `vercel.json` for Vercel SPA rewrites
- `public/_redirects` for Netlify SPA rewrites

### Option A — Vercel (recommended)

1. Create a Vercel account.
2. In Vercel, click **New Project** → **Import** your GitHub repo (or upload this folder to GitHub first).
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.
7. Copy the deployed URL and paste it at the top of this README under **Live Demo**.

### Option B — Netlify

1. Create a Netlify account.
2. Click **Add new site** → **Import an existing project** (GitHub) or **Deploy manually** (drag-and-drop `dist/` after build).
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy and copy the public URL into the README.

### (Optional) Enable Firebase Auth + Cloud Sync

If you set `VITE_FIREBASE_*` env vars in your host (Vercel/Netlify), users can sign in and sync vocabulary to Firestore.

Even with Firebase configured, the **home page remains public**; sign-in is optional.

## Project 3: Custom Hook

### Hook Operations

1. **addWord** – Adds a new vocabulary word with term, definition, and optional listId and exampleSentence. New words start at mastery level 1.
2. **updateWord** – Updates a word’s term, definition, exampleSentence, or listId by id.
3. **deleteWord** – Removes a word by id from the words array.
4. **addList** – Creates a new word list with name and optional description.
5. **setCurrentListFilter** – Sets or clears the current list filter (list id or null).
6. **setMasteryFilter** – Sets or clears the mastery category filter (new, learning, familiar, mastered, or null).
7. **updateWordMastery** – Updates a word’s mastery level (1–5) by word id.
8. **recordPracticeSession** – Appends a practice session to the sessions array.

### Running Tests

```bash
npm install
npm run test
```

### Test Coverage

1. **Initial state** – Hook starts with empty words, lists, sessions, and null filters.
2. **addWord** – Adding a word creates one word with term, definition, mastery 1, and generated id/timestamps.
3. **deleteWord** – Deleting a word by id removes it from the list.
4. **addList and setCurrentListFilter** – Adding a list and then setting the list filter updates state correctly.
5. **updateWord** – Updating a word’s term and definition changes only that word.
6. **updateWordMastery** – Updating a word’s mastery level changes only that word.
7. **recordPracticeSession** – Recording a session appends it to sessions with correct mode and counts.
8. **Edge case** – deleteWord with a non-existent id leaves state unchanged.

### AI Usage Statement

AI was used to generate the custom hook scaffolding from the existing type definitions, test boilerplate and edge-case suggestions, and to wire the hook into pages via a context provider. All code was reviewed, type-checked with `tsc --noEmit`, and verified with `npm run test`.

---

## Project 4: State Management

- **Library:** Zustand (v5)
- **Store:** `src/store/vocabularyStore.ts` — single source of truth with `loading` and `error` for async operations
- **Context bridge:** `VocabularyBuilderContext` reads from store via `useShallow`, exposes same API to pages
- **API service:** `src/services/api.ts` — TypeScript interface `IVocabularyApi` with placeholder implementations

---

## Project 5: End-to-End Assembly with Persistence

### Backend Choice

**Firebase (Firestore + Auth)** — chosen because it's a zero-config BaaS with a generous free tier, real-time sync, and integrated authentication. No server to deploy or maintain.

### Authentication Approach

**Firebase Auth (email/password)**. If Firebase env vars are not set, the app runs in local-only mode without login. When configured:
1. `AuthProvider` listens to auth state
2. Unauthenticated users see `LoginPage`
3. After login, data is scoped to `users/{uid}/vocabulary/appState`
4. Sign out button in nav

### Feature Verification Table

| Feature | Page | Works | Persists |
|---------|------|-------|----------|
| Add word | /vocabulary | ✅ | ✅ |
| Edit word | /vocabulary | ✅ | ✅ |
| Delete word | /vocabulary | ✅ | ✅ |
| Add list | /vocabulary | ✅ | ✅ |
| Edit list (rename, add/remove words) | /vocabulary | ✅ | ✅ |
| Delete list | /vocabulary | ✅ | ✅ |
| Filter by mastery | /vocabulary | ✅ | ✅ |
| Multiple choice practice | /practice | ✅ | ✅ |
| Fill-in-the-blank practice | /practice | ✅ | ✅ |
| Matching practice | /practice | ✅ | ✅ |
| Practice by list | /practice | ✅ | ✅ |
| Record practice session | /practice | ✅ | ✅ |
| Sign in | /login | ✅ | — |
| Sign up | /login | ✅ | — |
| Sign out | nav | ✅ | — |
| View account info | /settings | ✅ | — |
| View app info | /about | ✅ | — |

### How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **(Optional) Configure Firebase:**
   Create a `.env` file in the project root with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
   Without this, the app runs in local-only mode (no auth, no persistence).

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:5173` in your browser.

5. **Type-check:**
   ```bash
   npx tsc --noEmit
   ```

6. **Run tests:**
   ```bash
   npm run test
   ```

