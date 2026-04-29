import { useVocabularyBuilderContext } from '../context/VocabularyBuilderContext'
import { AppShell } from '../components/AppShell'
import { AuthRequiredDialog } from '../components/AuthRequiredDialog'
import {
  PageLayout, Heading, Text, StatusBanner,
} from '../components/ui'
import { useVocabularyViewModel } from '../features/vocabulary/useVocabularyViewModel'
import { VocabularyFoldersView } from '../features/vocabulary/VocabularyFoldersView'
import { VocabularyFolderDetailView } from '../features/vocabulary/VocabularyFolderDetailView'

function VocabularyPage() {
  useVocabularyBuilderContext()
  const vm = useVocabularyViewModel()

  return (
    <AppShell>
      <PageLayout>
        <Heading level={1}>Vocabulary</Heading>
        <Text>
          Organize your vocabulary into folders. Click a folder to view and edit its words.
        </Text>

        <StatusBanner loading={vm.state.loading} error={vm.state.error} />

        {vm.selectedList ? (
          <VocabularyFolderDetailView vm={vm} />
        ) : (
          <VocabularyFoldersView vm={vm} />
        )}

        <AuthRequiredDialog
          open={vm.authGate.open}
          message={vm.authGate.message}
          onCancel={() => vm.authGate.setOpen(false)}
          onGoLogin={vm.authGate.goLogin}
        />
      </PageLayout>
    </AppShell>
  )
}

export default VocabularyPage
