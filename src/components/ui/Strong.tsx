import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface StrongProps {
  children: ReactNode
  className?: string
}

export function Strong({ children, className }: StrongProps) {
  return (
    <Typography component="strong" fontWeight={700} className={className}>
      {children}
    </Typography>
  )
}
