import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface TextProps {
  children: ReactNode
  as?: 'p' | 'span'
  className?: string
}

export function Text({ children, as: component = 'p', className }: TextProps) {
  return (
    <Typography variant="body1" component={component} className={className} sx={{ my: 0.5 }}>
      {children}
    </Typography>
  )
}
