import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService, type User } from '../services/auth'

type AuthValue = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((u) => {
      setUser(u)
      setLoading(false)
    })
    if (!unsub) setLoading(false)
    return () => unsub?.()
  }, [])

  const signOut = async () => {
    await authService.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue | null {
  return useContext(AuthContext)
}
