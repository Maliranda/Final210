import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import { BrandLogo } from './BrandLogo'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import BookRoundedIcon from '@mui/icons-material/BookRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

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
            <span className="nav-item">
              <HomeRoundedIcon fontSize="small" />
              Home
            </span>
          </NavLink>
          <NavLink to="/vocabulary" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <BookRoundedIcon fontSize="small" />
              Vocabulary
            </span>
          </NavLink>
          <NavLink to="/practice" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <SchoolRoundedIcon fontSize="small" />
              Practice
            </span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <SettingsRoundedIcon fontSize="small" />
              Settings
            </span>
          </NavLink>
        </div>
        <div className="nav-right">
          <button
            type="button"
            className="nav-burger"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuRoundedIcon fontSize="small" />
          </button>
          {!auth?.user && (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-item">
                <LoginRoundedIcon fontSize="small" />
                Login
              </span>
            </NavLink>
          )}
          {requireLogin && auth?.user && (
            <button
              type="button"
              className="nav-sign-out"
              onClick={handleSignOut}
              disabled={loggingOut}
            >
              <span className="nav-item">
                <LogoutRoundedIcon fontSize="small" />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </span>
            </button>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          role="presentation"
          onClick={closeMobileMenu}
        />
      )}
      <aside
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <div className="mobile-menu-header">
          <div className="mobile-menu-title">Menu</div>
          <button type="button" className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>
        <div className="mobile-menu-links">
          <NavLink to="/" end onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <HomeRoundedIcon fontSize="small" />
              Home
            </span>
          </NavLink>
          <NavLink to="/vocabulary" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <BookRoundedIcon fontSize="small" />
              Vocabulary
            </span>
          </NavLink>
          <NavLink to="/practice" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <SchoolRoundedIcon fontSize="small" />
              Practice
            </span>
          </NavLink>
          <NavLink to="/settings" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-item">
              <SettingsRoundedIcon fontSize="small" />
              Settings
            </span>
          </NavLink>
        </div>
        <div className="mobile-menu-actions">
          {!auth?.user && (
            <NavLink to="/login" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-item">
                <LoginRoundedIcon fontSize="small" />
                Login
              </span>
            </NavLink>
          )}
          {requireLogin && auth?.user && (
            <button
              type="button"
              className="nav-sign-out"
              onClick={async () => {
                closeMobileMenu()
                await handleSignOut()
              }}
              disabled={loggingOut}
            >
              <span className="nav-item">
                <LogoutRoundedIcon fontSize="small" />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </span>
            </button>
          )}
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  )
}

