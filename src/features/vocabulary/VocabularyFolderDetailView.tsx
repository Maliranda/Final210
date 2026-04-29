import Box from '@mui/material/Box'
import type { SelectOption } from '../../components/ui'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Form,
  FormField,
  Input,
  List,
  ListItem,
  Section,
  Select,
  Strong,
  Text,
} from '../../components/ui'
import type { MasteryCategory } from '../../types'
import type { useVocabularyViewModel } from './useVocabularyViewModel'

type VM = ReturnType<typeof useVocabularyViewModel>

const masteryOptions: SelectOption[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'learned', label: 'Learned' },
]

const masteryLevelOptions: SelectOption[] = [
  { value: '1', label: 'New' },
  { value: '2', label: 'Learned' },
]

export function VocabularyFolderDetailView({ vm }: { vm: VM }) {
  if (!vm.selectedList) return null
  const folder = vm.selectedList

  return (
    <Section title={`Folder: ${folder.name}`}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
        <Button variant="secondary" onClick={() => vm.setSelectedListId(null)}>
          ← Back to folders
        </Button>

        {!vm.isUndefinedFolder(folder.id) ? (
          <>
            <Form
              onSubmit={(e) => {
                e.preventDefault()
                vm.renameSelectedFolder()
              }}
            >
              <Input
                placeholder="Rename folder"
                value={vm.renameFolderValue}
                onChange={(e) => vm.setRenameFolderValue(e.target.value)}
                style={{ minWidth: 200 }}
              />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </Form>
            <Button variant="danger" onClick={() => vm.requestDeleteFolder(folder.id, folder.name)}>
              Delete folder
            </Button>
          </>
        ) : (
          <Text>
            Words without a folder are saved in <Strong>{vm.undefinedFolderName}</Strong>.
          </Text>
        )}
      </Box>

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          vm.addWordFromForm()
        }}
      >
        <Input placeholder="Term" value={vm.term} onChange={(e) => vm.setTerm(e.target.value)} />
        <Input placeholder="Definition" value={vm.definition} onChange={(e) => vm.setDefinition(e.target.value)} />
        <FormField label="Mastery:">
          <Select
            options={masteryLevelOptions}
            value={vm.addWordMastery}
            onChange={(e) => vm.setAddWordMastery(e.target.value)}
          />
        </FormField>
        <Button type="submit">Add word</Button>
      </Form>

      <FormField label="Filter by mastery:">
        <Select
          options={masteryOptions}
          value={vm.state.masteryFilter ?? ''}
          onChange={(e) => vm.setMasteryFilter((e.target.value || null) as MasteryCategory | null)}
        />
      </FormField>

      {vm.wordsInFolder(folder.id).length === 0 ? (
        <EmptyState message="No words in this folder yet." />
      ) : (
        <List>
          {vm.wordsInFolder(folder.id).map((word) => (
            <ListItem key={word.id}>
              {vm.editingWord?.id === word.id ? (
                <Card>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault()
                      vm.saveEditingWord()
                    }}
                  >
                    <Input
                      placeholder="Term"
                      value={vm.editingWord.term}
                      onChange={(e) => vm.setEditingWord({ ...vm.editingWord!, term: e.target.value })}
                    />
                    <Input
                      placeholder="Definition"
                      value={vm.editingWord.definition}
                      onChange={(e) => vm.setEditingWord({ ...vm.editingWord!, definition: e.target.value })}
                    />
                    <FormField label="Mastery:">
                      <Select
                        options={masteryLevelOptions}
                        value={vm.editingWord.mastery}
                        onChange={(e) => vm.setEditingWord({ ...vm.editingWord!, mastery: e.target.value })}
                      />
                    </FormField>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                      <FormField label="Add to folder:">
                        <Select
                          options={[
                            { value: '', label: '— choose —' },
                            ...vm.lists.map((l) => ({ value: l.id, label: l.name })),
                          ]}
                          value={vm.editingWord.addToFolderId}
                          onChange={(e) => vm.setEditingWord({ ...vm.editingWord!, addToFolderId: e.target.value })}
                        />
                      </FormField>
                      <Button
                        variant="secondary"
                        disabled={!vm.editingWord.addToFolderId}
                        onClick={vm.copyEditingWordToFolder}
                      >
                        Add
                      </Button>
                    </Box>
                    <Button type="submit">Save</Button>
                    <Button variant="secondary" onClick={() => vm.setEditingWord(null)}>
                      Cancel
                    </Button>
                  </Form>
                </Card>
              ) : (
                <>
                  <Box component="span">
                    <Strong>{word.term}</Strong> – {word.definition} ({word.masteryLevel === 1 ? 'New' : 'Learned'})
                  </Box>
                  <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }}>
                    <Button variant="secondary" onClick={() => vm.startEditWord(word)} aria-label={`Edit ${word.term}`}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => vm.requestDeleteWord(word)} aria-label={`Delete ${word.term}`}>
                      Delete
                    </Button>
                  </Box>
                </>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <ConfirmDialog
        open={vm.wordToDelete !== null}
        title="Delete word?"
        message={
          vm.wordToDelete
            ? `Are you sure you want to delete "${vm.wordToDelete.term}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={vm.confirmDeleteWord}
        onCancel={() => vm.setWordToDelete(null)}
      />

      <ConfirmDialog
        open={vm.listToDelete !== null}
        title="Delete folder?"
        message={
          vm.listToDelete
            ? `Delete folder "${vm.listToDelete.name}"? Words will be moved to "${vm.undefinedFolderName}". This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={vm.confirmDeleteFolder}
        onCancel={() => vm.setListToDelete(null)}
      />
    </Section>
  )
}

