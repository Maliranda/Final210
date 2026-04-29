import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
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

export class FirebaseAuthService implements AuthService {
  isConfigured(): boolean {
    return isFirebaseConfigured()
  }

  async signIn(email: string, password: string): Promise<User> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  async signUp(email: string, password: string): Promise<User> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  }

  async signOut(): Promise<void> {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase Auth not configured')
    await firebaseSignOut(auth)
  }

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe | undefined {
    const auth = getAuthInstance()
    if (!auth) return undefined
    return onAuthStateChanged(auth, callback)
  }

  getCurrentUser(): User | null {
    const auth = getAuthInstance()
    return auth?.currentUser ?? null
  }
}

export const authService: AuthService = new FirebaseAuthService()

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/weak-password':
        return 'Your password is too weak. Please choose a stronger password.'
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.'
      case 'auth/user-not-found':
        return 'No account found for this email. Try signing up instead.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a bit and try again.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.'
      case 'auth/unauthorized-domain':
        return 'Login is not available on this domain yet. Please contact the app owner.'
      default:
        return 'Authentication failed. Please try again.'
    }
  }

  return err instanceof Error ? err.message : 'Authentication failed. Please try again.'
}
