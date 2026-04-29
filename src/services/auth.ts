import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { getAuthInstance, isFirebaseConfigured } from './firebase-config'

export type { User } from 'firebase/auth'

export interface AuthService {
  isConfigured(): boolean
  signIn(email: string, password: string): Promise<User>
  signUp(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe | undefined
  getCurrentUser(): User | null
}

export const authService: AuthService = {
  isConfigured() {
    return isFirebaseConfigured()
  },

  async signIn(email: string, password: string): Promise<User> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  },

  async signUp(email: string, password: string): Promise<User> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  },

  async signOut(): Promise<void> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    await firebaseSignOut(auth)
  },

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe | undefined {
    const auth = getAuthInstance()
    if (!auth) return undefined
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser(): User | null {
    const auth = getAuthInstance()
    return auth?.currentUser ?? null
  },
}
