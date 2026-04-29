import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import type { SelectChangeEvent } from '@mui/material/Select'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value: string
  onChange?: (event: SelectChangeEvent<string>) => void
  className?: string
  id?: string
  name?: string
}

export function Select({ options, value, onChange, className }: SelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }} className={className}>
      <MuiSelect
        value={value}
        onChange={onChange}
        displayEmpty
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}
