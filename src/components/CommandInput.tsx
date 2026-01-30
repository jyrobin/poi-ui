import { useState, useRef, useEffect } from 'react'
import { Box, InputBase, Paper, List, ListItemButton, ListItemText, Typography, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import TerminalIcon from '@mui/icons-material/Terminal'
import { api } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useCommandHistory } from '../hooks/useCommandHistory'
import { useFocusModule } from '../hooks/useFocusModule'

const COMMANDS = [
  { name: 'bootstrap', description: 'Create initial docs' },
  { name: 'update-docs', description: 'Update DESIGN.md/NOTES.md' },
  { name: 'fix-docs', description: 'Fix evaluation gaps' },
  { name: 'evaluate', description: 'Evaluate documentation' },
  { name: 'review', description: 'Review documentation' },
  { name: 'status', description: 'Workspace health overview' },
]

const REPORT_COMMANDS: Record<string, { title: string; type: string }> = {
  session: { title: 'Session Overview', type: 'session' },
  health: { title: 'Health Check', type: 'health' },
  coverage: { title: 'Coverage Report', type: 'coverage' },
  deps: { title: 'Dependencies', type: 'deps' },
  tags: { title: 'Tags', type: 'tags' },
  gotchas: { title: 'Gotchas', type: 'gotchas' },
  entities: { title: 'Entities', type: 'entities' },
}

const FALLBACK_MODULES = ['poi', 'voiceturn', 'cliq', 'new-svc', 'utils']

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
  const [modules, setModules] = useState<string[]>(FALLBACK_MODULES)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [savedInput, setSavedInput] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)
  const inputRef = useRef<HTMLInputElement>(null)
  const { open } = useDrawer()
  const { history, addCommand } = useCommandHistory()
  const focusModule = useFocusModule((s) => s.module)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleOpenModules = () => {
    open({
      title: 'Workspace Modules',
      content: '',
      mode: 'modules',
    })
    handleMenuClose()
  }

  const handleShowCommands = () => {
    const commandOptions = COMMANDS.map(c => ({ value: c.name, label: c.name, description: c.description }))
    const reportOptions = Object.entries(REPORT_COMMANDS).map(([name, def]) => ({ value: name, label: name, description: def.title }))
    setOptions([...commandOptions, ...reportOptions])
    setShowAutocomplete(true)
    handleMenuClose()
    inputRef.current?.focus()
  }

  // Fetch modules from API on mount
  useEffect(() => {
    api.getModules()
      .then((data) => setModules(data.map((m) => m.name)))
      .catch(() => setModules(FALLBACK_MODULES))
  }, [])

  // Determine autocomplete context
  useEffect(() => {
    const atIndex = value.lastIndexOf('@')

    if (atIndex >= 0 && atIndex === value.length - 1 || (atIndex >= 0 && !value.slice(atIndex).includes(' '))) {
      const query = value.slice(atIndex + 1).toLowerCase()
      const filtered = modules
        .filter(m => m.toLowerCase().startsWith(query))
        .map(m => ({ value: m, label: `@${m}` }))
      setOptions(filtered)
      setShowAutocomplete(filtered.length > 0)
    } else if (!value.includes(' ') && !value.includes('@')) {
      const query = value.toLowerCase()
      const commandOptions = COMMANDS
        .filter(c => c.name.startsWith(query))
        .map(c => ({ value: c.name, label: c.name, description: c.description }))
      const reportOptions = Object.entries(REPORT_COMMANDS)
        .filter(([name]) => name.startsWith(query))
        .map(([name, def]) => ({ value: name, label: name, description: def.title }))
      const filtered = [...commandOptions, ...reportOptions]
      setOptions(filtered)
      setShowAutocomplete(filtered.length > 0 && value.length > 0)
    } else {
      setShowAutocomplete(false)
    }
    setSelectedIndex(0)
  }, [value, modules])

  const handleSelect = (option: AutocompleteOption) => {
    const atIndex = value.lastIndexOf('@')
    if (atIndex >= 0 && !value.slice(atIndex).includes(' ')) {
      setValue(value.slice(0, atIndex) + '@' + option.value + ' ')
    } else {
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

    if (!showAutocomplete && history.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (historyIndex === -1) {
          setSavedInput(value)
        }
        const newIndex = Math.min(historyIndex + 1, history.length - 1)
        setHistoryIndex(newIndex)
        setValue(history[newIndex])
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyIndex <= 0) {
          setHistoryIndex(-1)
          setValue(savedInput)
        } else {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setValue(history[newIndex])
        }
        return
      }
    }

    if (e.key === 'Enter' && value.trim() && !showAutocomplete) {
      e.preventDefault()
      await executeCommand()
    }

    if (e.key === 'Escape') {
      setValue('')
      setHistoryIndex(-1)
      setSavedInput('')
    }
  }

  const executeCommand = async () => {
    const trimmed = value.trim()
    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    const moduleMatch = trimmed.match(/@(\S+)/)
    const module = moduleMatch ? moduleMatch[1] : (focusModule || '')

    if (!command) return

    addCommand(trimmed)
    setHistoryIndex(-1)
    setSavedInput('')

    // Check if this is a report command
    const reportDef = REPORT_COMMANDS[command]
    if (reportDef) {
      open({
        title: reportDef.title,
        content: '',
        mode: 'report',
        reportType: reportDef.type,
        moduleName: module || undefined,
      })
      setValue('')
      return
    }

    // Preview the command expansion
    setLoading(true)
    try {
      const preview = await api.previewCommand({ command, module })
      const title = module
        ? `poi ${command} -m ${module}`
        : `poi ${command}`

      open({
        title,
        content: '',
        mode: 'command-preview',
        commandPreview: preview,
      })
      setValue('')
    } catch {
      open({
        title: `poi ${command}${module ? ` -m ${module}` : ''}`,
        content: `# ${command}${module ? ` ${module}` : ''}\n\n(API unavailable)`,
        mode: 'output',
      })
      setValue('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
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
          onClick={handleMenuOpen}
          sx={{
            color: menuOpen ? 'primary.main' : 'text.secondary',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
            mr: 0.5,
            userSelect: 'none',
            cursor: 'pointer',
            borderRadius: 0.5,
            px: 0.5,
            mx: -0.5,
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'rgba(124, 156, 255, 0.08)',
            },
          }}
        >
          /
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ '& .MuiPaper-root': { minWidth: 180 } }}
        >
          <MenuItem onClick={handleOpenModules} sx={{ gap: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <ViewModuleOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Modules
          </MenuItem>
          <MenuItem onClick={handleShowCommands} sx={{ gap: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <TerminalIcon fontSize="small" />
            </ListItemIcon>
            Commands
          </MenuItem>
          {history.length > 0 && (
            <>
              <Divider />
              <Typography
                variant="caption"
                sx={{ px: 2, py: 0.5, color: 'text.secondary', display: 'block' }}
              >
                Recent
              </Typography>
              {history.slice(0, 5).map((cmd, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    setValue(cmd)
                    handleMenuClose()
                    inputRef.current?.focus()
                  }}
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  {cmd}
                </MenuItem>
              ))}
            </>
          )}
        </Menu>
        <InputBase
          inputRef={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
          placeholder={focusModule ? `command (@${focusModule})` : 'command @module'}
          disabled={loading}
          fullWidth
          inputProps={{ 'data-command-input': true }}
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
