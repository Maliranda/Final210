import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ColorMode = 'light' | 'dark'

type ThemeModeValue = {
  mode: ColorMode
  setMode: (mode: ColorMode) => void
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeValue | null>(null)

const STORAGE_KEY = 'vocabify.colorMode'

function readInitialMode(): ColorMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() => readInitialMode())

  const setMode = (next: ColorMode) => {
    setModeState(next)
  }

  const toggleMode = () => {
    setModeState((m) => (m === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.dataset.theme = mode
  }, [mode])

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode])

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}

export function useThemeMode(): ThemeModeValue {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider')
  return ctx
}

