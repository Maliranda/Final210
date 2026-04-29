import { useState } from 'react'
import Box from '@mui/material/Box'
import { useVocabularyBuilderContext } from '../context/VocabularyBuilderContext'
import {
  PageLayout, Heading, Text, AppLink, Section, Form, Input, Button,
  FormField, Select, type SelectOption, List, ListItem, EmptyState, Strong, Card, StatusBanner, ConfirmDialog,
} from '../components/ui'
import type { MasteryCategory, MasteryLevel, VocabularyWord } from '../types'

function matchesMastery(word: VocabularyWord, filter: MasteryCategory | null): boolean {
  if (!filter) return true
  return filter === 'new' ? word.masteryLevel === 1 : word.masteryLevel === 2
}

const MASTERY_FILTER: SelectOption[] = [
  { value: '', label: 'All' }, { value: 'new', label: 'New' }, { value: 'learned', label: 'Learned' },
]
const MASTERY_LEVELS: SelectOption[] = [
  { value: '1', label: 'New' }, { value: '2', label: 'Learned' },
]

function VocabularyPage() {
  const {
    state, addWord, updateWord, updateWordMastery, deleteWord,
    addList, updateList, deleteList, setMasteryFilter,
  } = useVocabularyBuilderContext()

  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [listName, setListName] = useState('')
  const [addWordListId, setAddWordListId] = useState('')
  const [newListNameForWord, setNewListNameForWord] = useState('')
  const [addWordMastery, setAddWordMastery] = useState('1')

  const [editingWord, setEditingWord] = useState<{ id: string; term: string; definition: string; mastery: string } | null>(null)
  const [editingList, setEditingList] = useState<{ id: string; name: string; addWordId: string } | null>(null)
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null)
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null)

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!term.trim() || !definition.trim()) return
    const level = (Number(addWordMastery) === 2 ? 2 : 1) as MasteryLevel
    let listId: string | null = null
    if (addWordListId === '__new__' && newListNameForWord.trim()) {
      listId = addList(newListNameForWord.trim()).id
      setNewListNameForWord('')
    } else if (addWordListId && addWordListId !== '__new__') {
      listId = addWordListId
    }
    addWord(term.trim(), definition.trim(), { masteryLevel: level, listId })
    setTerm(''); setDefinition(''); setAddWordListId('')
  }

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault()
    if (!listName.trim()) return
    addList(listName.trim()); setListName('')
  }

  const saveWord = () => {
    if (!editingWord) return
    const level = (Number(editingWord.mastery) === 2 ? 2 : 1) as MasteryLevel
    updateWord(editingWord.id, { term: editingWord.term.trim(), definition: editingWord.definition.trim() })
    updateWordMastery(editingWord.id, level)
    setEditingWord(null)
  }

  const saveList = () => {
    if (!editingList?.name.trim()) return
    updateList(editingList.id, { name: editingList.name.trim() })
    setEditingList(null)
  }

  const handleDeleteWordClick = (word: VocabularyWord) => {
    setWordToDelete(word)
  }

  const handleConfirmDeleteWord = () => {
    if (wordToDelete) {
      deleteWord(wordToDelete.id)
      setWordToDelete(null)
    }
  }

  const handleDeleteListClick = (listId: string, listName: string) => {
    setListToDelete({ id: listId, name: listName })
  }

  const handleConfirmDeleteList = () => {
    if (listToDelete) {
      deleteList(listToDelete.id)
      if (editingList?.id === listToDelete.id) setEditingList(null)
      setListToDelete(null)
    }
  }

  const filteredWords = state.words.filter((w) => matchesMastery(w, state.masteryFilter))
  const wordsInList = (id: string) => state.words.filter((w) => w.listId === id)
  const wordsNotInList = (id: string) => state.words.filter((w) => w.listId !== id)

  const listSelectOptions: SelectOption[] = [
    { value: '', label: 'No list' },
    ...state.lists.map((l) => ({ value: l.id, label: l.name })),
    { value: '__new__', label: '+ Create new list' },
  ]

  const wordCountTitle = state.masteryFilter
    ? `Your words (${filteredWords.length} of ${state.words.length})`
    : `Your words (${state.words.length})`

  return (
    <PageLayout>
      <Heading level={1}>Vocabulary</Heading>
      <Text>
        Manage your vocabulary words: add new terms with definitions, edit or delete
        existing ones, and organize words into themed lists.
      </Text>
      <Text as="span"><AppLink to="/">← Back to Home</AppLink></Text>

      <StatusBanner loading={state.loading} error={state.error} />

      <Section title={wordCountTitle}>
        <Form onSubmit={handleAddWord}>
          <Input placeholder="Term" value={term} onChange={(e) => setTerm(e.target.value)} />
          <Input placeholder="Definition" value={definition} onChange={(e) => setDefinition(e.target.value)} />
          <FormField label="List:">
            <Select options={listSelectOptions} value={addWordListId} onChange={(e) => setAddWordListId(e.target.value)} />
          </FormField>
          {addWordListId === '__new__' && (
            <Input placeholder="New list name" value={newListNameForWord} onChange={(e) => setNewListNameForWord(e.target.value)} />
          )}
          <FormField label="Mastery:">
            <Select options={MASTERY_LEVELS} value={addWordMastery} onChange={(e) => setAddWordMastery(e.target.value)} />
          </FormField>
          <Button type="submit">Add word</Button>
        </Form>

        <FormField label="Filter by mastery:">
          <Select options={MASTERY_FILTER} value={state.masteryFilter ?? ''} onChange={(e) => setMasteryFilter((e.target.value || null) as MasteryCategory | null)} />
        </FormField>

        {state.words.length === 0 ? (
          <EmptyState message="No words yet. Add one above!" />
        ) : filteredWords.length === 0 ? (
          <EmptyState message={`No words match "${state.masteryFilter}". Change the filter or add words.`} />
        ) : (
          <List>
            {filteredWords.map((word) => (
              <ListItem key={word.id}>
                {editingWord?.id === word.id ? (
                  <Card>
                    <Form onSubmit={(e) => { e.preventDefault(); saveWord() }}>
                      <Input placeholder="Term" value={editingWord.term} onChange={(e) => setEditingWord({ ...editingWord, term: e.target.value })} />
                      <Input placeholder="Definition" value={editingWord.definition} onChange={(e) => setEditingWord({ ...editingWord, definition: e.target.value })} />
                      <FormField label="Mastery:">
                        <Select options={MASTERY_LEVELS} value={editingWord.mastery} onChange={(e) => setEditingWord({ ...editingWord, mastery: e.target.value })} />
                      </FormField>
                      <Button type="submit">Save</Button>
                      <Button variant="secondary" onClick={() => setEditingWord(null)}>Cancel</Button>
                    </Form>
                  </Card>
                ) : (
                  <>
                    <Box component="span">
                      <Strong>{word.term}</Strong> – {word.definition} ({ word.masteryLevel === 1 ? 'New' : 'Learned' })
                    </Box>
                    <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <Button variant="secondary" onClick={() => setEditingWord({ id: word.id, term: word.term, definition: word.definition, mastery: String(word.masteryLevel) })} aria-label={`Edit ${word.term}`}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDeleteWordClick(word)} aria-label={`Delete ${word.term}`}>Delete</Button>
                    </Box>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      <Section title={`Lists (${state.lists.length})`}>
        <Text>Create themed lists to group words. Edit a list to change its name or add/remove words.</Text>
        <Form onSubmit={handleAddList}>
          <Input placeholder="List name" value={listName} onChange={(e) => setListName(e.target.value)} />
          <Button type="submit">Add list</Button>
        </Form>
        {state.lists.length > 0 && (
          <List>
            {state.lists.map((list) => (
              <ListItem key={list.id}>
                {editingList?.id === list.id ? (
                  <Box sx={{ mt: 1 }}>
                    <Card>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Form onSubmit={(e) => { e.preventDefault(); saveList() }}>
                          <Input placeholder="List name" value={editingList.name} onChange={(e) => setEditingList({ ...editingList, name: e.target.value })} style={{ minWidth: 200 }} />
                          <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }}>
                            <Button type="submit">Save name</Button>
                            <Button variant="secondary" onClick={() => setEditingList(null)}>Cancel</Button>
                          </Box>
                        </Form>
                        <Box component="p" sx={{ fontWeight: 600, m: 0, my: 0.5 }}>
                          Words in this list ({wordsInList(list.id).length})
                        </Box>
                        {wordsInList(list.id).length === 0 ? (
                          <EmptyState message="No words in this list yet." />
                        ) : (
                          <List>
                            {wordsInList(list.id).map((w) => (
                              <ListItem key={w.id}>
                                <Box component="span"><Strong>{w.term}</Strong> – {w.definition}</Box>
                                <Button variant="secondary" onClick={() => updateWord(w.id, { listId: null })} aria-label={`Remove ${w.term} from list`}>Remove from list</Button>
                              </ListItem>
                            ))}
                          </List>
                        )}
                        {wordsNotInList(list.id).length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                            <FormField label="Add word:">
                              <Select
                                options={[
                                  { value: '', label: '— choose —' },
                                  ...wordsNotInList(list.id).map((w) => ({
                                    value: w.id,
                                    label: `${w.term} – ${w.definition.slice(0, 30)}${w.definition.length > 30 ? '…' : ''}`,
                                  })),
                                ]}
                                value={editingList.addWordId}
                                onChange={(e) => setEditingList({ ...editingList, addWordId: e.target.value })}
                              />
                            </FormField>
                            <Button variant="secondary" disabled={!editingList.addWordId} onClick={() => {
                              if (!editingList.addWordId) return
                              updateWord(editingList.addWordId, { listId: editingList.id })
                              setEditingList({ ...editingList, addWordId: '' })
                            }}>Add to list</Button>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </Box>
                ) : (
                  <>
                    <Box component="span">{list.name}</Box>
                    <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <Button variant="secondary" onClick={() => setEditingList({ id: list.id, name: list.name, addWordId: '' })} aria-label={`Edit list ${list.name}`}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDeleteListClick(list.id, list.name)} aria-label={`Delete list ${list.name}`}>Delete</Button>
                    </Box>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      <ConfirmDialog
        open={wordToDelete !== null}
        title="Delete word?"
        message={wordToDelete ? `Are you sure you want to delete "${wordToDelete.term}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeleteWord}
        onCancel={() => setWordToDelete(null)}
      />

      <ConfirmDialog
        open={listToDelete !== null}
        title="Delete list?"
        message={listToDelete ? `Are you sure you want to delete the list "${listToDelete.name}"? Words in it will stay but will have no list. This cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeleteList}
        onCancel={() => setListToDelete(null)}
      />
    </PageLayout>
  )
}

export default VocabularyPage
