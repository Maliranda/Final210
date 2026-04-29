import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { authService, getAuthErrorMessage } from '../services/auth'
import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../context/AuthContext'
import {
  PageLayout, Heading, Text, Section, Form, Input, Button, FormField, BackLink,
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
        <BrandLogo size={44} />
      </Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" letterSpacing="-0.02em">
        Vocabify
      </Typography>
    </Box>
  )
}

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth?.user) navigate('/', { replace: true })
  }, [auth?.user, navigate])

  if (!authService.isConfigured()) {
    return (
      <PageLayout>
        <Box sx={{ py: 4, px: 3, maxWidth: 480, margin: '0 auto' }}>
          <Heading level={1}>Login</Heading>
          <Text>Firebase is not configured. Add VITE_FIREBASE_* env variables to enable login.</Text>
          <Text as="span">
            <BackLink to="/" />
          </Text>
        </Box>
      </PageLayout>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.trim() || !password) {
      setError('Enter email and password.')
      return
    }
    setLoading(true)
    try {
      await authService.signIn(email.trim(), password)
      setSuccess('Signed in successfully.')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
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
      setSuccess('Successfully registered.')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
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
          <Button variant={tab === 'signin' ? 'primary' : 'secondary'} onClick={() => { setTab('signin'); setError(null); setSuccess(null) }}>
            Sign in
          </Button>
          <Button variant={tab === 'signup' ? 'primary' : 'secondary'} onClick={() => { setTab('signup'); setError(null); setSuccess(null) }}>
            Sign up
          </Button>
        </Box>

        {success && (
          <Box sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: 'success.light', color: 'success.dark' }}>
            <Text>{success}</Text>
          </Box>
        )}

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
