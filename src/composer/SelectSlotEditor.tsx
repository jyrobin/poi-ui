import { Box, Typography, Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'

interface SelectSlotEditorProps {
  slot: SlotDefinition
  onDone: () => void
}

export default function SelectSlotEditor({ slot, onDone }: SelectSlotEditorProps) {
  const { values, setSlotValue } = useComposer()
  const selected = (values[slot.name] as string[]) || []
  const options = slot.options || []

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      setSlotValue(slot.name, selected.filter((o) => o !== option))
    } else {
      setSlotValue(slot.name, [...selected, option])
    }
  }

  const handleSelectAll = () => {
    setSlotValue(slot.name, [...options])
  }

  const handleClear = () => {
    setSlotValue(slot.name, [])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
          {slot.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {slot.required && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Required
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selected.length} of {options.length} selected
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  size="small"
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.8125rem',
                  }}
                >
                  {option}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          size="small"
          variant="text"
          onClick={handleSelectAll}
          sx={{ color: 'text.secondary' }}
        >
          Select All
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleClear}
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          Clear
        </Button>
        <Button size="small" variant="contained" onClick={onDone}>
          Done
        </Button>
      </Box>
    </Box>
  )
}
