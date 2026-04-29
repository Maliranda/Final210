import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface HeadingProps {
  level?: 1 | 2 | 3
  children: ReactNode
  className?: string
}

const variantMap = { 1: 'h1' as const, 2: 'h2' as const, 3: 'h3' as const }

export function Heading({ level = 1, children, className }: HeadingProps) {
  return (
    <Typography variant={variantMap[level]} className={className} gutterBottom>
      {children}
    </Typography>
  )
}
