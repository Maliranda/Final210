import Box from '@mui/material/Box'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded'
import type { SelectOption } from '../../components/ui'
import {
  Button,
  Card,
  EmptyState,
  Form,
  FormField,
  Input,
  Section,
  Select,
  Text,
} from '../../components/ui'
import type { MasteryCategory } from '../../types'
import type { useVocabularyViewModel } from './useVocabularyViewModel'

type VM = ReturnType<typeof useVocabularyViewModel>

export function VocabularyFoldersView({ vm }: { vm: VM }) {
  const masteryOptions: SelectOption[] = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'learned', label: 'Learned' },
  ]

  const masteryLevelOptions: SelectOption[] = [
    { value: '1', label: 'New' },
    { value: '2', label: 'Learned' },
  ]

  return (
    <Section title={`Folders (${vm.lists.length})`}>
      {vm.state.words.length === 0 && (
        <Card>
          <EmptyState
            message="No words yet. Add your first word using the form below."
            action={
              <Text>
                Tip: start with 5–10 words, then open <strong>Practice</strong> to test yourself.
              </Text>
            }
          />
        </Card>
      )}

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          vm.addWordFromForm()
        }}
      >
        <Input
          placeholder={`Term (adds to "${vm.undefinedFolderName}")`}
          value={vm.term}
          onChange={(e) => vm.setTerm(e.target.value)}
        />
        <Input
          placeholder="Definition"
          value={vm.definition}
          onChange={(e) => vm.setDefinition(e.target.value)}
        />
        <FormField label="Folder:">
          <Select
            options={[
              { value: '', label: vm.undefinedFolderName },
              ...vm.lists.map((l) => ({ value: l.id, label: l.name })),
              { value: '__new__', label: '+ Create new folder' },
            ]}
            value={vm.addWordFolderId}
            onChange={(e) => vm.setAddWordFolderId(e.target.value)}
          />
        </FormField>
        {vm.addWordFolderId === '__new__' && (
          <Input
            placeholder="New folder name"
            value={vm.newFolderNameForWord}
            onChange={(e) => vm.setNewFolderNameForWord(e.target.value)}
          />
        )}
        <FormField label="Mastery:">
          <Select
            options={masteryLevelOptions}
            value={vm.addWordMastery}
            onChange={(e) => vm.setAddWordMastery(e.target.value)}
          />
        </FormField>
        <Button type="submit">
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <AddRoundedIcon fontSize="small" />
            Add word
          </Box>
        </Button>
      </Form>

      <FormField label="Filter by mastery:">
        <Select
          options={masteryOptions}
          value={vm.state.masteryFilter ?? ''}
          onChange={(e) => vm.setMasteryFilter((e.target.value || null) as MasteryCategory | null)}
        />
      </FormField>

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          vm.createFolder()
        }}
      >
        <Input
          placeholder="New folder name"
          value={vm.newFolderName}
          onChange={(e) => vm.setNewFolderName(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <CreateNewFolderRoundedIcon fontSize="small" />
            Create folder
          </Box>
        </Button>
      </Form>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {vm.lists.map((l) => {
          const count = vm.wordsInFolder(l.id).length
          const isSys = vm.isUndefinedFolder(l.id)
          return (
            <Box
              key={l.id}
              role="button"
              tabIndex={0}
              onClick={() => vm.setSelectedListId(l.id)}
              onKeyDown={(e) => e.key === 'Enter' && vm.setSelectedListId(l.id)}
              sx={{
                width: 140,
                height: 140,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid rgba(107, 70, 193, 0.14)',
                boxShadow: '0 8px 24px rgba(107, 70, 193, 0.10)',
                cursor: 'pointer',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(107, 70, 193, 0.14)' },
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                outline: 'none',
              }}
            >
              <Box>
                <Box
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {l.name}
                </Box>
                <Text>
                  {count} {count === 1 ? 'word' : 'words'}
                </Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{isSys ? 'System' : 'Custom'}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>Open →</Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Section>
  )
}

