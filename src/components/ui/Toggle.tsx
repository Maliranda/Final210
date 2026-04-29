import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

export interface ToggleProps {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, label, onChange, disabled }: ToggleProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          disabled={disabled}
          onChange={(_, next) => onChange(next)}
        />
      }
      label={label}
    />
  )
}

