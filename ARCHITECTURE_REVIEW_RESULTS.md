# Architecture Review Results

> Analyzed on: 2026-04-29  
> Project: `vocabulary-builder` (`/Users/lizamaranda/Downloads/SDT210-main`)  
> Total components analyzed: 31 (pages: 6, UI components: 20, other components: 1, contexts: 3, hooks: 1)  
> Issues found: 6

## Summary

The project has a solid separation between **domain state (Zustand store)** and **UI primitives (MUI wrappers in `src/components/ui/`)**, and the authentication + persistence logic is mostly kept out of pages. The biggest architectural risk is **mixed abstraction and “god page” components**, plus the **app shell living in `App.tsx`** (router-level layout), which makes pages less self-contained and harder to evolve.

## Issues

### ARCH-01: Router-level app shell (layout is coupled to router)

**Severity**: High  
**Principle**: Missing Layout / Proper Layering  
**Location**: `src/App.tsx`

Right now the navigation + shell (`<nav>` + `<main>`) lives in `App.tsx` around the router. This couples the layout to React Router and makes individual pages incomplete fragments.

#### Current (Bad)

```tsx
// src/App.tsx (shortened)
return (
  <VocabularyBuilderProvider>
    <div className="app">
      <nav className="nav">{/* ... */}</nav>
      <main className="main">
        <Routes>{/* pages */}</Routes>
      </main>
    </div>
  </VocabularyBuilderProvider>
)
```

#### Recommended (Good)

```tsx
// src/components/AppShell.tsx
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <nav className="nav">{/* ... */}</nav>
      <main className="main">{children}</main>
    </div>
  )
}

// src/pages/VocabularyPage.tsx (example)
export default function VocabularyPage() {
  return (
    <AppShell>
      <PageLayout>{/* page content */}</PageLayout>
    </AppShell>
  )
}
```

**Why this is better**: Pages become self-contained and the shell can evolve without touching routing.

---

### ARCH-02: Pages mix high-level composition with low-level UI logic (SLA violations)

**Severity**: High  
**Principle**: SLA Violation  
**Location**: `src/pages/VocabularyPage.tsx`, `src/pages/PracticePage.tsx`

Both pages handle multiple responsibilities: view state, auth gating, domain mutations, dialog state, and complex JSX. This makes changes risky and hides intent.

#### Current (Bad)

```tsx
// src/pages/VocabularyPage.tsx (shortened)
const [editingWord, setEditingWord] = useState(...)
const [selectedListId, setSelectedListId] = useState(...)
const ensureAuth = () => { /* opens modal */ }
// ... many handlers + large JSX blocks ...
```

#### Recommended (Good)

```tsx
// src/pages/VocabularyPage.tsx
export default function VocabularyPage() {
  const vm = useVocabularyViewModel()
  return (
    <PageLayout>
      <VocabularyHeader vm={vm} />
      <FoldersGrid vm={vm} />
      <FolderDetail vm={vm} />
      <AuthRequiredDialog open={vm.authDialogOpen} onGoLogin={vm.goLogin} />
    </PageLayout>
  )
}
```

**Why this is better**: Each component operates at one abstraction level; page reads like a sentence.

---

### ARCH-03: Auth gating logic is duplicated in multiple pages

**Severity**: Medium  
**Principle**: Minimal Duplication / Clear Data Flow  
**Location**: `src/pages/VocabularyPage.tsx`, `src/pages/PracticePage.tsx`

The `ensureAuth()` pattern + dialog state appears in multiple places. This repetition is easy to diverge and hard to keep consistent.

#### Current (Bad)

```tsx
const [authDialogOpen, setAuthDialogOpen] = useState(false)
const ensureAuth = () => {
  if (!requireLogin) return true
  if (auth?.user) return true
  setAuthDialogOpen(true)
  return false
}
```

#### Recommended (Good)

```tsx
// src/hooks/useRequireAuthAction.ts
export function useRequireAuthAction() {
  const auth = useAuth()
  const requireLogin = authService.isConfigured()
  const [open, setOpen] = useState(false)
  const guard = () => (!requireLogin || auth?.user) ? true : (setOpen(true), false)
  return { open, setOpen, guard }
}
```

**Why this is better**: One source of truth for gating + messaging.

---

### ARCH-04: Service layer is “functions + singleton object”; difficult to test/replace

**Severity**: Medium  
**Principle**: Missing API Abstraction  
**Location**: `src/services/api.ts`, `src/services/auth.ts`

The external API abstraction exists (good), but it’s a singleton object and direct Firebase imports are embedded in the module. This is harder to mock and makes dependency injection awkward.

#### Current (Bad)

```ts
export const vocabularyApi: IVocabularyApi = {
  async loadState(userId) { /* firebase calls */ },
  async saveState(state, userId) { /* firebase calls */ },
}
```

#### Recommended (Good)

```ts
export class VocabularyApi {
  constructor(private deps: { db: Firestore }) {}
  async loadState(userId: string) { /* ... */ }
  async saveState(state: AppState, userId: string) { /* ... */ }
}
```

**Why this is better**: Easier to test (inject mocks), easier to swap backend later.

---

### ARCH-05: “Undefined folder” behavior is encoded via magic IDs across layers

**Severity**: Low  
**Principle**: Clear Data Flow  
**Location**: `src/store/vocabularyStore.ts`, `src/pages/VocabularyPage.tsx`

The system folder is implemented with `UNDEFINED_LIST_ID = '__undefined__'` and referenced in multiple files. This works, but it’s easy for pages to accidentally treat it as a normal list.

#### Recommended (Good)

- Keep `UNDEFINED_LIST_ID` (fine), but expose a small helper API from the store module:
  - `isSystemList(id)` / `getSystemLists()`
  - `moveWordsToSystemList(listId)`

**Why this is better**: Reduces accidental misuse and centralizes the rule.

---

### ARCH-06: `HomePage` still uses raw HTML blocks for layout

**Severity**: Low  
**Principle**: SLA Violation  
**Location**: `src/pages/HomePage.tsx`

The page mixes `PageLayout` + UI components with raw `div` wrappers for the hero blobs. This is mostly visual scaffolding, but it’s a repeated pattern.

#### Recommended (Good)

Extract a `HeroSection` UI component that owns the decorative blobs and hero layout, so `HomePage` composes named parts only.

## Recommendations Summary

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | ARCH-01: Move app shell into a reusable `AppShell` used by pages | Med | High |
| 2 | ARCH-02: Split `VocabularyPage` / `PracticePage` into view-model + subcomponents | Med/High | High |
| 3 | ARCH-03: Deduplicate auth gating into a hook/helper | Low | Med |
| 4 | ARCH-04: Convert singleton services into injectable classes | Med | Med |
| 5 | ARCH-05: Centralize “system list” rule helpers | Low | Low |
| 6 | ARCH-06: Extract `HeroSection` | Low | Low |

## Architecture Health Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Single Level of Abstraction | 3 | UI layer is good; pages still do too much |
| Component API Design | 3 | UI wrapper APIs are consistent; page-level APIs are implicit |
| Data Flow Clarity | 4 | Store + context bridge is clear; a few magic IDs bleed upward |
| API Abstraction Layer | 3 | Abstraction exists but not easily injectable/testable |
| App Layout / Shell | 2 | Shell lives at router level, pages not self-contained |
| Code Duplication | 3 | Some duplication (auth gating) remains |
| Composition Patterns | 3 | Good UI primitives; page composition still heavy |
| **Overall** | **3** | Strong foundation; next step is decomposing pages + extracting app shell |

