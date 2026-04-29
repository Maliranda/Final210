import MuiButton from '@mui/material/Button'
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

const muiVariant: Record<NonNullable<ButtonProps['variant']>, MuiButtonProps['variant']> = {
  primary: 'contained',
  secondary: 'outlined',
  danger: 'contained',
}

export function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <MuiButton
      type={type}
      variant={muiVariant[variant]}
      className={className}
      sx={
        variant === 'danger'
          ? { bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }
          : undefined
      }
      {...rest}
    >
      {children}
    </MuiButton>
  )
}
