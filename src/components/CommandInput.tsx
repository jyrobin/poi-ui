import { useState, useRef, useEffect } from 'react'
import { Box, InputBase, Paper, List, ListItemButton, ListItemText, Typography } from '@mui/material'
import { api } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'

const COMMANDS = [
  { name: 'update', description: 'Update DESIGN.md/NOTES.md' },
  { name: 'bootstrap', description: 'Create initial docs' },
  { name: 'fix', description: 'Fix evaluation gaps' },
  { name: 'investigate', description: 'Debug with context' },
  { name: 'context', description: 'Gather navigation context' },
  { name: 'evaluate', description: 'Evaluate documentation' },
  { name: 'status', description: 'Workspace health overview' },
]

// Mock modules - will be replaced with API call
const MODULES = ['poi', 'voiceturn', 'cliq', 'new-svc', 'utils']

interface AutocompleteOption {
  value: string
  label: string
  description?: string
}

export default function CommandInput() {
  const [value, setValue] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { open } = useDrawer()

  // Determine autocomplete context
  useEffect(() => {
    const atIndex = value.lastIndexOf('@')

    if (atIndex >= 0 && atIndex === value.length - 1 || (atIndex >= 0 && !value.slice(atIndex).includes(' '))) {
      // Module autocomplete after @
      const query = value.slice(atIndex + 1).toLowerCase()
      const filtered = MODULES
        .filter(m => m.toLowerCase().startsWith(query))
        .map(m => ({ value: m, label: `@${m}` }))
      setOptions(filtered)
      setShowAutocomplete(filtered.length > 0)
    } else if (!value.includes(' ') && !value.includes('@')) {
      // Command autocomplete at start
      const query = value.toLowerCase()
      const filtered = COMMANDS
        .filter(c => c.name.startsWith(query))
        .map(c => ({ value: c.name, label: c.name, description: c.description }))
      setOptions(filtered)
      setShowAutocomplete(filtered.length > 0 && value.length > 0)
    } else {
      setShowAutocomplete(false)
    }
    setSelectedIndex(0)
  }, [value])

  const handleSelect = (option: AutocompleteOption) => {
    const atIndex = value.lastIndexOf('@')
    if (atIndex >= 0 && !value.slice(atIndex).includes(' ')) {
      // Replace module part
      setValue(value.slice(0, atIndex) + '@' + option.value + ' ')
    } else {
      // Replace command part
      setValue(option.value + ' ')
    }
    setShowAutocomplete(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, options.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (options[selectedIndex]) {
          e.preventDefault()
          handleSelect(options[selectedIndex])
          return
        }
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false)
        return
      }
    }

    if (e.key === 'Enter' && value.trim() && !showAutocomplete) {
      e.preventDefault()
      await executeCommand()
    }
  }

  const executeCommand = async () => {
    const trimmed = value.trim()
    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    const moduleMatch = trimmed.match(/@(\S+)/)
    const module = moduleMatch ? moduleMatch[1] : ''

    if (!command) return

    setLoading(true)
    try {
      const result = await api.generatePrompt({ command, module })
      open({
        title: result.title || `/${command} @${module}`,
        content: result.prompt,
        mode: 'output',
      })
      setValue('')
    } catch {
      open({
        title: `/${command}${module ? ` @${module}` : ''}`,
        content: `# ${command}${module ? ` ${module}` : ''}\n\n(API unavailable - showing placeholder)`,
        mode: 'output',
      })
      setValue('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Autocomplete dropdown (shows above input) */}
      {showAutocomplete && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            mb: 0.5,
            maxHeight: 200,
            overflow: 'auto',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <List dense sx={{ py: 0.5 }}>
            {options.map((option, index) => (
              <ListItemButton
                key={option.value}
                selected={index === selectedIndex}
                onClick={() => handleSelect(option)}
                sx={{
                  py: 0.5,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(124, 156, 255, 0.15)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.75rem',
                        color: 'primary.main',
                      }}
                    >
                      {option.label}
                    </Typography>
                  }
                  secondary={option.description && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}
                    >
                      {option.description}
                    </Typography>
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {/* Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.default',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          px: 1.5,
          py: 0.75,
          opacity: loading ? 0.7 : 1,
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 1px rgba(124, 156, 255, 0.2)',
          },
        }}
      >
        <Box
          component="span"
          sx={{
            color: 'text.secondary',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
            mr: 0.5,
            userSelect: 'none',
          }}
        >
          /
        </Box>
        <InputBase
          inputRef={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
          placeholder="command @module"
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              p: 0,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8125rem',
              color: 'text.primary',
              '&::placeholder': {
                color: 'text.secondary',
                opacity: 0.6,
              },
            },
          }}
        />
      </Box>
    </Box>
  )
}
