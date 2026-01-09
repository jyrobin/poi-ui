import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel } from '@mui/material'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'

interface ChoiceSlotEditorProps {
  slot: SlotDefinition
  onDone: () => void
}

export default function ChoiceSlotEditor({ slot, onDone }: ChoiceSlotEditorProps) {
  const { values, setSlotValue } = useComposer()
  const value = (values[slot.name] as string) || ''
  const options = slot.options || []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
          {slot.label}
        </Typography>
        {slot.required && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Required
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <RadioGroup
          value={value}
          onChange={(e) => setSlotValue(slot.name, e.target.value)}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio size="small" />}
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
        </RadioGroup>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setSlotValue(slot.name, '')}
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
