import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { VocabularyBuilderProvider } from './context/VocabularyBuilderContext'
import { authService } from './services/auth'
import HomePage from './pages/HomePage'
import VocabularyPage from './pages/VocabularyPage'
import PracticePage from './pages/PracticePage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'

function AppContent() {
  const auth = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const requireLogin = authService.isConfigured()

  const handleSignOut = async () => {
    if (!auth?.signOut) return
    setLoggingOut(true)
    try {
      await auth.signOut()
    } finally {
      setLoggingOut(false)
    }
  }

  if (auth?.loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <VocabularyBuilderProvider>
      <div className="app">
        <nav className="nav">
          <NavLink to="/" className="nav-brand" end>
            <span className="nav-brand-icon" aria-hidden>📚</span>
            Vocabulary Builder
          </NavLink>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
            <NavLink to="/vocabulary" className={({ isActive }) => (isActive ? 'active' : '')}>
              Vocabulary
            </NavLink>
            <NavLink to="/practice" className={({ isActive }) => (isActive ? 'active' : '')}>
              Practice
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
            {requireLogin && !auth?.user && (
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign in
              </NavLink>
            )}
            {requireLogin && auth?.user && (
              <button
                type="button"
                className="nav-sign-out"
                onClick={handleSignOut}
                disabled={loggingOut}
              >
                {loggingOut ? '…' : 'Sign out'}
              </button>
            )}
          </div>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
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
