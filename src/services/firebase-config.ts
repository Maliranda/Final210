import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null
  try {
    if (getApps().length === 0) app = initializeApp(firebaseConfig)
    else if (!app) app = getApps()[0] as FirebaseApp
    return app
  } catch (e) {
    console.warn('Firebase init failed:', e)
    return null
  }
}

export function getFirestoreInstance(): Firestore | null {
  const firebaseApp = getApp()
  if (!firebaseApp) return null
  try {
    if (!db) db = getFirestore(firebaseApp)
    return db
  } catch (e) {
    console.warn('Firestore init failed:', e)
    return null
  }
}

export function getAuthInstance(): Auth | null {
  const firebaseApp = getApp()
  if (!firebaseApp) return null
  try {
    if (!auth) auth = getAuth(firebaseApp)
    return auth
  } catch (e) {
    console.warn('Firebase Auth init failed:', e)
    return null
  }
}
