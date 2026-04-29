import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  message: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <Box className={className} sx={{ py: 2, px: 1, color: 'text.secondary', textAlign: 'center' }}>
      <Typography variant="body2" sx={{ m: 0 }}>
        {message}
      </Typography>
      {action != null && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  )
}
