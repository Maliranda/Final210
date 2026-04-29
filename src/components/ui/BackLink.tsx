import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { AppLink } from './AppLink'

export interface BackLinkProps {
  to: string
  children?: ReactNode
  sx?: SxProps<Theme>
}

export function BackLink({ to, children = '← Back to Home', sx }: BackLinkProps) {
  return (
    <AppLink
      to={to}
      sx={[
        (theme) => ({
          color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.primary.main,
          '&:hover': {
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.dark,
          },
        }),
        ...(sx != null ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      {children}
    </AppLink>
  )
}

