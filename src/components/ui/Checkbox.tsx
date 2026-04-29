import MuiCheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

export interface CheckboxProps {
  checked: boolean
  label: string
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({ checked, label, disabled, onChange }: CheckboxProps) {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          disabled={disabled}
          onChange={(_, next) => onChange(next)}
        />
      }
      label={label}
    />
  )
}

