import { useState } from 'react'
import { Box, Typography, Button, IconButton, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useComposer } from '../hooks/useComposer'
import { useDrawer } from '../hooks/useDrawer'
import { api, SlotDefinition } from '../api/client'
import SlotRow from '../composer/SlotRow'

export default function ComposerBlock() {
  const { command, module, schema, values, clearComposer } = useComposer()
  const { open } = useDrawer()
  const [loading, setLoading] = useState(false)

  if (!command || !schema) {
    return null
  }

  const handleSlotClick = (slot: SlotDefinition) => {
    open({
      title: `Edit: ${slot.label}`,
      content: '', // Will be replaced by slot editor
      mode: 'input',
      slotName: slot.name,
    } as any) // Extended drawer content
  }

  const handlePreview = async () => {
    setLoading(true)
    try {
      const result = await api.buildPrompt({
        command,
        module: module || '',
        slots: values,
      })
      open({
        title: result.title || `/${command} @${module}`,
        content: result.prompt,
        mode: 'output',
      })
    } catch {
      // Generate a placeholder preview
      const slotSummary = Object.entries(values)
        .filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
        .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n')

      open({
        title: `/${command} @${module}`,
        content: `# ${command} ${module}\n\n${schema.description}\n\n## Slot Values\n${slotSummary || '(no values set)'}\n\n(API unavailable - showing placeholder)`,
        mode: 'output',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    setLoading(true)
    try {
      const result = await api.buildPrompt({
        command,
        module: module || '',
        slots: values,
      })
      await navigator.clipboard.writeText(result.prompt)
    } catch {
      // Copy placeholder
      await navigator.clipboard.writeText(`/${command} @${module}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'rgba(124, 156, 255, 0.05)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8125rem',
              color: 'primary.main',
            }}
          >
            /{command}
            {module && (
              <Box component="span" sx={{ color: 'text.primary', ml: 1 }}>
                @{module}
              </Box>
            )}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {schema.description}
          </Typography>
        </Box>
        <IconButton size="small" onClick={clearComposer} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Slot rows */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {schema.slots.map((slot) => (
          <SlotRow key={slot.name} slot={slot} onClick={() => handleSlotClick(slot)} />
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, p: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handlePreview}
          disabled={loading}
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          {loading ? <CircularProgress size={16} /> : 'Preview'}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleCopy}
          disabled={loading}
        >
          Copy
        </Button>
      </Box>
    </Box>
  )
}
