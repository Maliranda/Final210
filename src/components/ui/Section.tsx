import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface SectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <Box
      component="section"
      className={className}
      sx={{
        my: 2,
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(107, 70, 193, 0.06)',
        border: '1px solid rgba(107, 70, 193, 0.08)',
      }}
    >
      {title != null && (
        <Typography variant="h6" component="h2" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  )
}
