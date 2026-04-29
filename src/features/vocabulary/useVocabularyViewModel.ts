import { useMemo, useState } from 'react'
import type { MasteryLevel, VocabularyWord } from '../../types'
import { useVocabularyBuilderContext } from '../../context/VocabularyBuilderContext'
import { useRequireAuthAction } from '../../hooks/useRequireAuthAction'
import { UNDEFINED_LIST_ID, UNDEFINED_LIST_NAME } from '../../store/vocabularyStore'

export type EditingWordDraft = {
  id: string
  term: string
  definition: string
  mastery: string
  addToFolderId: string
}

const MASTERY_LEVEL_FROM_STRING = (value: string): MasteryLevel => (Number(value) === 2 ? 2 : 1)

export function useVocabularyViewModel() {
  const {
    state, addWord, updateWord, updateWordMastery, deleteWord,
    addList, updateList, deleteList, setMasteryFilter,
  } = useVocabularyBuilderContext()

  const authGate = useRequireAuthAction('Please sign in (or create an account) to add and practice vocabulary.')

  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [editingWord, setEditingWord] = useState<EditingWordDraft | null>(null)
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null)
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null)

  const [newFolderName, setNewFolderName] = useState('')
  const [renameFolderValue, setRenameFolderValue] = useState('')

  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [addWordMastery, setAddWordMastery] = useState('1')
  const [addWordFolderId, setAddWordFolderId] = useState('')
  const [newFolderNameForWord, setNewFolderNameForWord] = useState('')

  const lists = state.lists
  const selectedList = selectedListId ? lists.find((l) => l.id === selectedListId) ?? null : null

  const filteredWords = useMemo(() => {
    const filter = state.masteryFilter
    if (!filter) return state.words
    return state.words.filter((w) => (filter === 'new' ? w.masteryLevel === 1 : w.masteryLevel === 2))
  }, [state.words, state.masteryFilter])

  const wordsInFolder = (id: string) => filteredWords.filter((w) => w.listId === id)

  const createFolder = () => {
    if (!authGate.guard()) return
    if (!newFolderName.trim()) return
    const created = addList(newFolderName.trim())
    setNewFolderName('')
    setSelectedListId(created.id)
  }

  const renameSelectedFolder = () => {
    if (!authGate.guard()) return
    if (!selectedList) return
    if (!renameFolderValue.trim()) return
    updateList(selectedList.id, { name: renameFolderValue.trim() })
    setRenameFolderValue('')
  }

  const addWordFromForm = () => {
    if (!authGate.guard()) return
    if (!term.trim() || !definition.trim()) return
    const level = MASTERY_LEVEL_FROM_STRING(addWordMastery)

    let targetListId = selectedList?.id ?? UNDEFINED_LIST_ID
    if (!selectedList) {
      if (addWordFolderId === '__new__') {
        if (!newFolderNameForWord.trim()) return
        targetListId = addList(newFolderNameForWord.trim()).id
        setNewFolderNameForWord('')
      } else if (addWordFolderId) {
        targetListId = addWordFolderId
      }
    }

    addWord(term.trim(), definition.trim(), { masteryLevel: level, listId: targetListId })
    setTerm('')
    setDefinition('')
    setAddWordFolderId('')
  }

  const startEditWord = (word: VocabularyWord) => {
    setEditingWord({
      id: word.id,
      term: word.term,
      definition: word.definition,
      mastery: String(word.masteryLevel),
      addToFolderId: '',
    })
  }

  const saveEditingWord = () => {
    if (!authGate.guard()) return
    if (!editingWord) return
    const level = MASTERY_LEVEL_FROM_STRING(editingWord.mastery)
    updateWord(editingWord.id, { term: editingWord.term.trim(), definition: editingWord.definition.trim() })
    updateWordMastery(editingWord.id, level)
    setEditingWord(null)
  }

  const copyEditingWordToFolder = () => {
    if (!authGate.guard()) return
    if (!editingWord) return
    if (!editingWord.term.trim() || !editingWord.definition.trim()) return
    if (!editingWord.addToFolderId) return
    if (selectedList?.id && editingWord.addToFolderId === selectedList.id) return
    const level = MASTERY_LEVEL_FROM_STRING(editingWord.mastery)
    addWord(editingWord.term.trim(), editingWord.definition.trim(), { masteryLevel: level, listId: editingWord.addToFolderId })
    setEditingWord({ ...editingWord, addToFolderId: '' })
  }

  const requestDeleteWord = (word: VocabularyWord) => setWordToDelete(word)
  const confirmDeleteWord = () => {
    if (!authGate.guard()) return
    if (!wordToDelete) return
    deleteWord(wordToDelete.id)
    setWordToDelete(null)
  }

  const requestDeleteFolder = (id: string, name: string) => setListToDelete({ id, name })
  const confirmDeleteFolder = () => {
    if (!authGate.guard()) return
    if (!listToDelete) return
    deleteList(listToDelete.id)
    if (selectedListId === listToDelete.id) setSelectedListId(null)
    setListToDelete(null)
  }

  return {
    // domain + ui state
    state,
    lists,
    selectedList,
    selectedListId,
    editingWord,
    wordToDelete,
    listToDelete,

    // form state
    newFolderName,
    renameFolderValue,
    term,
    definition,
    addWordMastery,
    addWordFolderId,
    newFolderNameForWord,

    // derived
    wordsInFolder,
    undefinedFolderName: UNDEFINED_LIST_NAME,
    isUndefinedFolder: (id: string) => id === UNDEFINED_LIST_ID,

    // actions
    setSelectedListId,
    setEditingWord,
    setWordToDelete,
    setListToDelete,
    setNewFolderName,
    setRenameFolderValue,
    setTerm,
    setDefinition,
    setAddWordMastery,
    setAddWordFolderId,
    setNewFolderNameForWord,
    setMasteryFilter,

    createFolder,
    renameSelectedFolder,
    addWordFromForm,
    startEditWord,
    saveEditingWord,
    copyEditingWordToFolder,
    requestDeleteWord,
    confirmDeleteWord,
    requestDeleteFolder,
    confirmDeleteFolder,

    authGate,
  }
}

