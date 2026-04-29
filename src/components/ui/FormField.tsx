import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface FormFieldProps {
  label: string
  children: ReactNode
  className?: string
}

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <Box className={className} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Typography component="span" variant="body2" fontWeight={500}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}
