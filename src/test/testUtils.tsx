import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeModeProvider } from '../context/ThemeModeContext'
import { getAppTheme } from '../theme'
import App from '../App'
import type { AppState } from '../types'
import { useVocabularyStore } from '../store/vocabularyStore'

export function resetVocabularyStore(overrides: Partial<AppState> = {}) {
  const base: AppState = {
    words: [],
    lists: [],
    sessions: [],
    currentListFilter: null,
    masteryFilter: null,
    ...overrides,
  }
  useVocabularyStore.getState().replaceState(base)
}

export function renderApp(initialRoute = '/') {
  return render(
    <ThemeModeProvider>
      <ThemeProvider theme={getAppTheme('light')}>
        <CssBaseline />
        <MemoryRouter initialEntries={[initialRoute]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </ThemeModeProvider>,
  )
}
