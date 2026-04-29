import Box from '@mui/material/Box'
import { useVocabularyBuilderContext } from '../context/VocabularyBuilderContext'
import {
  PageLayout,
  Heading,
  Text,
  AppLink,
  List,
  ListItem,
  Strong,
  Section,
  StatusBanner,
} from '../components/ui'

function HomePage() {
  const { state } = useVocabularyBuilderContext()
  const wordLabel = state.words.length === 1 ? 'word' : 'words'
  const listLabel = state.lists.length === 1 ? 'list' : 'lists'

  return (
    <PageLayout>
      <div className="hero-wrap">
        <div className="hero-blob" aria-hidden />
        <div className="hero-blob hero-blob--left" aria-hidden />
        <Box component="section" sx={{ position: 'relative', marginBottom: '2.5rem' }}>
          <Heading level={1}>Learn vocabulary in one place</Heading>
          <Box sx={{ maxWidth: 560, color: 'text.secondary', mb: 1 }}>
            <Text>
              Add words with definitions, organize them into lists, and practice with
              multiple-choice, fill-in-the-blank, and matching modes. Track mastery levels
              and your progress over time.
            </Text>
          </Box>
          <Text>
            You have <Strong>{state.words.length}</Strong> {wordLabel} and{' '}
            <Strong>{state.lists.length}</Strong> {listLabel}.
          </Text>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <AppLink
              to="/vocabulary"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 1.25,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #7C3AED 0%, #6B46C1 100%)',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(107, 70, 193, 0.2)',
                '&:hover': { background: 'linear-gradient(135deg, #6B46C1 0%, #5B3AA8 100%)', color: '#fff' },
              }}
            >
              Go to Vocabulary
            </AppLink>
            <AppLink
              to="/practice"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.04)', color: 'primary.dark' },
              }}
            >
              Start Practice
            </AppLink>
          </Box>
        </Box>
      </div>

      <StatusBanner loading={state.loading} error={state.error} />

      <Box sx={{ mt: 3 }}>
        <Section title="Quick links">
          <List>
            <ListItem>
              <span>
                <AppLink to="/vocabulary">Vocabulary</AppLink>
                {' — '}
                Add, edit, and browse words; filter by mastery or list.
              </span>
            </ListItem>
            <ListItem>
              <span>
                <AppLink to="/practice">Practice</AppLink>
                {' — '}
                Multiple choice, fill-in-the-blank, matching, and quiz mode.
              </span>
            </ListItem>
          </List>
        </Section>
      </Box>
    </PageLayout>
  )
}

export default HomePage
