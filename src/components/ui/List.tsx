import MuiList from '@mui/material/List'
import type { ReactNode } from 'react'

export interface ListProps {
  children: ReactNode
  className?: string
}

export function List({ children, className }: ListProps) {
  return (
    <MuiList className={className} disablePadding sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {children}
    </MuiList>
  )
}
