import { Link as RouterLink, type LinkProps } from 'react-router-dom'
import Link from '@mui/material/Link'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

export interface AppLinkProps extends Omit<LinkProps, 'children'> {
  children: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

export function AppLink({ children, className, sx, ...linkProps }: AppLinkProps) {
  return (
    <Link
      component={RouterLink}
      className={className}
      underline="hover"
      color="primary"
      sx={[ { fontWeight: 500 }, ...(sx != null ? (Array.isArray(sx) ? sx : [sx]) : []) ]}
      {...linkProps}
    >
      {children}
    </Link>
  )
}
