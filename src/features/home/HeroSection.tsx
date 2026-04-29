import Box from '@mui/material/Box'
import { AppLink, Heading, Strong, Text } from '../../components/ui'

export function HeroSection({
  wordCount,
  listCount,
}: {
  wordCount: number
  listCount: number
}) {
  const wordLabel = wordCount === 1 ? 'word' : 'words'
  const listLabel = listCount === 1 ? 'list' : 'lists'

  return (
    <Box component="section" className="hero-wrap">
      <Box component="div" className="hero-blob" aria-hidden />
      <Box component="div" className="hero-blob hero-blob--left" aria-hidden />

      <Box sx={{ position: 'relative', marginBottom: '2.5rem' }}>
        <Heading level={1}>Learn vocabulary in one place</Heading>
        <Box sx={{ maxWidth: 560, color: 'text.secondary', mb: 1 }}>
          <Text>
            Add words with definitions, organize them into lists, and practice with
            multiple-choice, fill-in-the-blank, and matching modes. Track mastery levels
            and your progress over time.
          </Text>
        </Box>
        <Text>
          You have <Strong>{wordCount}</Strong> {wordLabel} and <Strong>{listCount}</Strong> {listLabel}.
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
              '&:hover': {
                background: 'linear-gradient(135deg, #6B46C1 0%, #5B3AA8 100%)',
                color: '#fff',
              },
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
    </Box>
  )
}

