import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <Box className={className} sx={{ py: 0 }}>
      {children}
    </Box>
  )
}
