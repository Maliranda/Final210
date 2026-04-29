import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

const primaryPurple = '#6B46C1'
const primaryDark = '#5B3AA8'
const primaryLight = '#9F7AEA'
const secondaryLavender = '#E9D5FF'
const gradientStart = '#7C3AED'

export function getAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
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
        default: isDark ? '#0B0B10' : '#FAFAFA',
        paper: isDark ? '#12121A' : '#ffffff',
      },
      text: {
        primary: isDark ? '#F3F4F6' : '#1F2937',
        secondary: isDark ? '#A1A1AA' : '#6B7280',
      },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 700, fontSize: '1.75rem' },
      h2: { fontWeight: 600, fontSize: '1.5rem' },
      h3: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
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
              backgroundColor: 'rgba(107, 70, 193, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: isDark ? '0 6px 26px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(107, 70, 193, 0.08)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(107, 70, 193, 0.1)',
            overflow: 'hidden',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              backgroundColor: isDark ? '#0F0F16' : '#fff',
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
            boxShadow: isDark ? '0 6px 26px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(107, 70, 193, 0.08)',
          },
        },
      },
    },
  })
}
