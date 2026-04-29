import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import { BrandLogo } from './BrandLogo'

export function AppShell({ children }: { children: ReactNode }) {
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

  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" className="nav-brand" end>
          <span className="nav-brand-icon" aria-hidden>
            <BrandLogo size={28} />
          </span>
        </NavLink>
        <div className="nav-left">
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
        </div>
        <div className="nav-right">
          {!auth?.user && (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              Login
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
      <main className="main">{children}</main>
    </div>
  )
}

