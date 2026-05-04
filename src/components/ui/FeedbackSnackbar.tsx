import type { SyntheticEvent } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

export interface FeedbackSnackbarProps {
  open: boolean
  message: string
  onClose: () => void
  severity?: 'error' | 'warning' | 'info' | 'success'
}

export function FeedbackSnackbar({
  open,
  message,
  onClose,
  severity = 'warning',
}: FeedbackSnackbarProps) {
  const handleClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return
    onClose()
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
