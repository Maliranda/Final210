import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export interface StatusBannerProps {
  loading?: boolean
  error?: string | null
}

export function StatusBanner({ loading, error }: StatusBannerProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, mb: 2, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.dark' }}>
        <CircularProgress size={18} color="inherit" />
        <Typography variant="body2">Loading data...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: 'error.light', color: 'error.dark' }}>
        <Typography variant="body2">{error}</Typography>
      </Box>
    )
  }

  return null
}
