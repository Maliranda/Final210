import Box from '@mui/material/Box'
import { useAuth } from '../context/AuthContext'
import { useThemeMode } from '../context/ThemeModeContext'
import { AppShell } from '../components/AppShell'
import { PageLayout, Heading, Text, Section, AppLink, Strong, Toggle } from '../components/ui'

export default function SettingsPage() {
  const auth = useAuth()
  const themeMode = useThemeMode()

  return (
    <AppShell>
      <PageLayout>
        <Heading level={1}>Settings</Heading>

      <Section title="Appearance">
        <Toggle
          checked={themeMode.mode === 'dark'}
          label="Dark mode"
          onChange={(checked) => themeMode.setMode(checked ? 'dark' : 'light')}
        />
      </Section>

      <Section title="Account">
        {auth?.user ? (
          <>
            <Text>Signed in as: <Strong>{auth.user.email}</Strong></Text>
            <Text>
              User ID:{' '}
              <Box
                component="code"
                sx={(theme) => ({
                  fontSize: '0.85em',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'grey.100',
                  color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                })}
              >
                {auth.user.uid}
              </Box>
            </Text>
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
    </AppShell>
  )
}
