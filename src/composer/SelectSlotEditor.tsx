import { useEffect, useState } from 'react'
import { Box, Typography, Button, Checkbox, FormControlLabel, FormGroup, CircularProgress } from '@mui/material'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'
import { api } from '../api/client'

// Mock files for when API is unavailable
const MOCK_FILES: Record<string, string[]> = {
  poi: ['cmd/poi/main.go', 'internal/schema/module.go', 'internal/tools/git.go', 'templates/context.tmpl'],
  voiceturn: ['src/handler.go', 'src/server.go', 'src/config.go', 'DESIGN.md'],
  cliq: ['src/index.ts', 'src/parser.ts', 'src/types.ts'],
  'new-svc': ['main.go', 'handler.go'],
}

interface SelectSlotEditorProps {
  slot: SlotDefinition
  onDone: () => void
}

export default function SelectSlotEditor({ slot, onDone }: SelectSlotEditorProps) {
  const { values, setSlotValue, module } = useComposer()
  const selected = (values[slot.name] as string[]) || []
  const [options, setOptions] = useState<string[]>(slot.options || [])
  const [loading, setLoading] = useState(false)

  // For 'files' slot, fetch options from API or use mock
  useEffect(() => {
    if (slot.name === 'files' && module) {
      setLoading(true)
      api.listFiles(module)
        .then((result) => {
          setOptions(result.files.map(f => f.path))
        })
        .catch(() => {
          // Use mock files
          setOptions(MOCK_FILES[module] || [])
        })
        .finally(() => setLoading(false))
    } else {
      setOptions(slot.options || [])
    }
  }, [slot.name, slot.options, module])

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : options.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
            No options available
          </Typography>
        ) : (
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
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          size="small"
          variant="text"
          onClick={handleSelectAll}
          disabled={loading || options.length === 0}
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
