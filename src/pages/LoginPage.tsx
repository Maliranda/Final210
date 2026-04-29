import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { authService } from '../services/auth'
import {
  PageLayout, Heading, Text, Section, Form, Input, Button, FormField,
} from '../components/ui'

function LoginLogo() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(107, 70, 193, 0.35)',
          mb: 2,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      </Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" letterSpacing="-0.02em">
        Vocabulary Builder
      </Typography>
    </Box>
  )
}

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!authService.isConfigured()) {
    return (
      <PageLayout>
        <Box sx={{ py: 4, px: 3, maxWidth: 480, margin: '0 auto' }}>
          <Heading level={1}>Login</Heading>
          <Text>Firebase is not configured. Add VITE_FIREBASE_* env variables to enable login.</Text>
        </Box>
      </PageLayout>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Enter email and password.')
      return
    }
    setLoading(true)
    try {
      await authService.signIn(email.trim(), password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Enter email and password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authService.signUp(email.trim(), password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <Box
        sx={{
          py: 5,
          px: 3,
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        <LoginLogo />
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Text>Sign in or create an account to sync your vocabulary across devices.</Text>
        </Box>

        <Section title={tab === 'signin' ? 'Sign in' : 'Create account'}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant={tab === 'signin' ? 'primary' : 'secondary'} onClick={() => { setTab('signin'); setError(null) }}>
            Sign in
          </Button>
          <Button variant={tab === 'signup' ? 'primary' : 'secondary'} onClick={() => { setTab('signup'); setError(null) }}>
            Sign up
          </Button>
        </Box>

        {error && (
          <Box sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: 'error.light', color: 'error.dark' }}>
            <Text>{error}</Text>
          </Box>
        )}

        {tab === 'signin' ? (
          <Form onSubmit={handleSignIn}>
            <FormField label="Email:">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ minWidth: 220 }} />
            </FormField>
            <FormField label="Password:">
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={{ minWidth: 220 }} />
            </FormField>
            <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
          </Form>
        ) : (
          <Form onSubmit={handleSignUp}>
            <FormField label="Email:">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ minWidth: 220 }} />
            </FormField>
            <FormField label="Password:">
              <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" style={{ minWidth: 220 }} />
            </FormField>
            <FormField label="Confirm password:">
              <Input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" style={{ minWidth: 220 }} />
            </FormField>
            <Button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Sign up'}</Button>
          </Form>
        )}
        </Section>
      </Box>
    </PageLayout>
  )
}
