import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getAppTheme } from './theme'
import { ErrorBoundary } from './ErrorBoundary'
import App from './App.tsx'
import './index.css'
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

function Providers() {
  const { mode } = useThemeMode()
  const theme = useMemo(() => getAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  )
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeModeProvider>
        <Providers />
      </ThemeModeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
