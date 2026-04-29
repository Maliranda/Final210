import { ConfirmDialog } from './ui/ConfirmDialog'

export interface AuthRequiredDialogProps {
  open: boolean
  message: string
  onCancel: () => void
  onGoLogin: () => void
}

export function AuthRequiredDialog({ open, message, onCancel, onGoLogin }: AuthRequiredDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Sign in required"
      message={message}
      confirmLabel="Go to Login"
      cancelLabel="Cancel"
      onConfirm={onGoLogin}
      onCancel={onCancel}
    />
  )
}

