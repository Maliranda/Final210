import Box from '@mui/material/Box'
import type { FormHTMLAttributes, ReactNode } from 'react'

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children'> {
  children: ReactNode
  className?: string
}

export function Form({ children, className, onSubmit, ...rest }: FormProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      className={className}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', my: 1 }}
      {...rest}
    >
      {children}
    </Box>
  )
}
