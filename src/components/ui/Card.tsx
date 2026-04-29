import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <MuiCard className={className} variant="outlined">
      <CardContent>{children}</CardContent>
    </MuiCard>
  )
}
