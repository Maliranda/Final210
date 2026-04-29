import { Suspense, lazy } from 'react'
import Box from '@mui/material/Box'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { VocabularyBuilderProvider } from './context/VocabularyBuilderContext'
import { Text } from './components/ui'

const HomePage = lazy(() => import('./pages/HomePage'))
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'))
const PracticePage = lazy(() => import('./pages/PracticePageClean'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

function AppContent() {
  const auth = useAuth()

  if (auth?.loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Text>Loading…</Text>
      </Box>
    )
  }

  return (
    <VocabularyBuilderProvider>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <Text>Loading…</Text>
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </VocabularyBuilderProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
