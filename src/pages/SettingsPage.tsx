import Box from '@mui/material/Box'
import { useAuth } from '../context/AuthContext'
import { PageLayout, Heading, Text, Section, AppLink, Strong } from '../components/ui'

export default function SettingsPage() {
  const auth = useAuth()

  return (
    <PageLayout>
      <Heading level={1}>Settings</Heading>
      <Text as="span"><AppLink to="/">← Back to Home</AppLink></Text>

      <Section title="Account">
        {auth?.user ? (
          <>
            <Text>Signed in as: <Strong>{auth.user.email}</Strong></Text>
            <Text>User ID: <Box component="code" sx={{ fontSize: '0.85em', bgcolor: 'grey.100', px: 0.5, borderRadius: 1 }}>{auth.user.uid}</Box></Text>
          </>
        ) : (
          <Text>Not signed in. Data is stored locally only.</Text>
        )}
      </Section>

      <Section title="Data">
        <Text>
          Your vocabulary data is automatically saved to Firebase Firestore whenever you make changes.
          Data syncs across devices when you sign in with the same account.
        </Text>
      </Section>

      <Section title="About this app">
        <Text>
          Vocabulary Builder helps you learn new words through spaced practice.
          Add words, organize them into lists, and practice with multiple choice,
          fill-in-the-blank, or matching modes.
        </Text>
        <Text as="span"><AppLink to="/about">More about the app →</AppLink></Text>
      </Section>
    </PageLayout>
  )
}
