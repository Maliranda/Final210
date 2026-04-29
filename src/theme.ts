import { createTheme } from '@mui/material/styles'

const primaryPurple = '#6B46C1'
const primaryDark = '#5B3AA8'
const primaryLight = '#9F7AEA'
const secondaryLavender = '#E9D5FF'
const gradientStart = '#7C3AED'

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryPurple,
      dark: primaryDark,
      light: primaryLight,
      contrastText: '#fff',
    },
    secondary: {
      main: secondaryLavender,
      light: '#F3E8FF',
      dark: '#C4B5FD',
      contrastText: primaryDark,
    },
    error: { main: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
    success: { main: '#059669', light: '#D1FAE5', dark: '#047857' },
    background: {
      default: '#FAFAFA',
      paper: '#ffffff',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 700, color: '#1F2937', fontSize: '1.75rem' },
    h2: { fontWeight: 600, color: '#1F2937', fontSize: '1.5rem' },
    h3: { fontWeight: 600, color: '#374151', fontSize: '1.25rem' },
    h6: { fontWeight: 600, color: '#374151', fontSize: '1rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: '0 1px 3px rgba(107, 70, 193, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${primaryPurple} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${primaryPurple} 0%, ${primaryDark} 100%)`,
          },
        },
        outlined: {
          borderColor: primaryPurple,
          color: primaryPurple,
          '&:hover': {
            borderColor: primaryDark,
            backgroundColor: 'rgba(107, 70, 193, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(107, 70, 193, 0.08)',
          border: '1px solid rgba(107, 70, 193, 0.1)',
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryLight,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryPurple,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(107, 70, 193, 0.08)',
        },
      },
    },
  },
})
