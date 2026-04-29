import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useVocabularyStore, getStoreDomainState } from '../store/vocabularyStore'
import { vocabularyApi } from '../services/api'
import { useAuth } from './AuthContext'
import type { VocabularyStoreState } from '../store/vocabularyStore'

type Actions = Pick<
  ReturnType<typeof useVocabularyStore.getState>,
  'addWord' | 'updateWord' | 'deleteWord' | 'addList' | 'updateList' | 'deleteList' |
  'setCurrentListFilter' | 'setMasteryFilter' | 'updateWordMastery' | 'recordPracticeSession'
>

type VocabularyBuilderValue = {
  state: Pick<VocabularyStoreState, 'words' | 'lists' | 'sessions' | 'currentListFilter' | 'masteryFilter' | 'loading' | 'error'>
} & Actions

const stateSelector = (s: VocabularyStoreState & Actions) => ({
  words: s.words, lists: s.lists, sessions: s.sessions,
  currentListFilter: s.currentListFilter, masteryFilter: s.masteryFilter,
  loading: s.loading, error: s.error,
})

const actionsSelector = (s: ReturnType<typeof useVocabularyStore.getState>) => ({
  addWord: s.addWord, updateWord: s.updateWord, deleteWord: s.deleteWord,
  addList: s.addList, updateList: s.updateList, deleteList: s.deleteList,
  setCurrentListFilter: s.setCurrentListFilter, setMasteryFilter: s.setMasteryFilter,
  updateWordMastery: s.updateWordMastery, recordPracticeSession: s.recordPracticeSession,
  replaceState: s.replaceState, setLoading: s.setLoading, setError: s.setError,
})

const VocabularyBuilderContext = createContext<VocabularyBuilderValue | null>(null)

export function VocabularyBuilderProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const userId = auth?.user?.uid ?? null

  const state = useVocabularyStore(useShallow(stateSelector))
  const actions = useVocabularyStore(useShallow(actionsSelector))

  const hasLocalMutationRef = useRef(false)
  const skipNextPersistRef = useRef(false)

  useEffect(() => {
    if (!vocabularyApi.isConfigured()) {
      actions.setLoading(false)
      actions.setError(null)
      return
    }
    hasLocalMutationRef.current = false
    actions.setLoading(true)
    actions.setError(null)
    let cancelled = false
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        actions.setLoading(false)
      }
    }, 15000)
    vocabularyApi.loadState(userId)
      .then((loaded) => {
        if (cancelled) return
        if (!hasLocalMutationRef.current) {
          skipNextPersistRef.current = true
          actions.replaceState(loaded)
        }
        actions.setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load state:', err)
        actions.setLoading(false)
        actions.setError(err instanceof Error ? err.message : 'Failed to load data')
      })
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [userId])

  useEffect(() => {
    if (!vocabularyApi.isConfigured()) return
    return useVocabularyStore.subscribe(() => {
      if (skipNextPersistRef.current) { skipNextPersistRef.current = false; return }
      hasLocalMutationRef.current = true
      vocabularyApi.saveState(getStoreDomainState(), userId).catch((err) => {
        console.error('Failed to save state:', err)
        actions.setError(err instanceof Error ? err.message : 'Failed to save data')
      })
    })
  }, [userId])

  return (
    <VocabularyBuilderContext.Provider value={{ state, ...actions }}>
      {children}
    </VocabularyBuilderContext.Provider>
  )
}

export function useVocabularyBuilderContext(): VocabularyBuilderValue {
  const ctx = useContext(VocabularyBuilderContext)
  if (!ctx) throw new Error('useVocabularyBuilderContext must be used within VocabularyBuilderProvider')
  return ctx
}
