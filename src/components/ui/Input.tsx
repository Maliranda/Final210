import TextField from '@mui/material/TextField'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'color'> {
  className?: string
}

export function Input({ className, ...rest }: InputProps) {
  return (
    <TextField
      size="small"
      variant="outlined"
      className={className}
      {...rest}
    />
  )
}
