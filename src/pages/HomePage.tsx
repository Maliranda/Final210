import Box from '@mui/material/Box'
import { useVocabularyBuilderContext } from '../context/VocabularyBuilderContext'
import { AppShell } from '../components/AppShell'
import { HeroSection } from '../features/home/HeroSection'
import {
  PageLayout,
  AppLink,
  List,
  ListItem,
  Section,
  StatusBanner,
} from '../components/ui'

function HomePage() {
  const { state } = useVocabularyBuilderContext()

  return (
    <AppShell>
      <PageLayout>
        <HeroSection wordCount={state.words.length} listCount={state.lists.length} />

        <StatusBanner loading={state.loading} error={state.error} />

        <Box sx={{ mt: 3 }}>
          <Section title="Quick links">
            <List>
              <ListItem>
                <Box component="span">
                  <AppLink to="/vocabulary">Vocabulary</AppLink>
                  {' — '}
                  Add, edit, and browse words; filter by mastery or list.
                </Box>
              </ListItem>
              <ListItem>
                <Box component="span">
                  <AppLink to="/practice">Practice</AppLink>
                  {' — '}
                  Multiple choice, fill-in-the-blank, matching, and quiz mode.
                </Box>
              </ListItem>
            </List>
          </Section>
        </Box>
      </PageLayout>
    </AppShell>
  )
}

export default HomePage
