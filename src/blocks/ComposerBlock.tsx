import { useState } from 'react'
import { Box, Typography, Button, IconButton, CircularProgress, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import { useComposer } from '../hooks/useComposer'
import { useDrawer } from '../hooks/useDrawer'
import { api, SlotDefinition } from '../api/client'
import SlotRow from '../composer/SlotRow'

export default function ComposerBlock() {
  const { command, module, schema, values, overrides, clearComposer, templateName } = useComposer()
  const { open } = useDrawer()
  const [loading, setLoading] = useState(false)

  if (!command || !schema) {
    return null
  }

  const handleViewTemplate = () => {
    if (templateName) {
      open({
        title: templateName,
        content: '',
        mode: 'template',
        templateName,
      })
    }
  }

  const handleSlotClick = (slot: SlotDefinition) => {
    // Fragment slots open fragment slot editor with Preview/Edit/Template tabs
    if (slot.type === 'fragment') {
      open({
        title: slot.label,
        content: '',
        mode: 'fragment-edit',
        slotName: slot.name,
        fragmentName: slot.fragment || slot.name,
      } as any)
      return
    }

    // Regular slots open slot editor
    open({
      title: `Edit: ${slot.label}`,
      content: '',
      mode: 'input',
      slotName: slot.name,
    } as any)
  }

  const handlePreview = async () => {
    setLoading(true)
    try {
      // Fetch both the built prompt and template source in parallel
      const [result, templateDetail] = await Promise.all([
        api.buildPrompt({
          command,
          module: module || '',
          slots: values,
          overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        }),
        templateName ? api.getTemplate(templateName).catch(() => null) : Promise.resolve(null),
      ])
      open({
        title: result.title || `/${command} @${module}`,
        content: result.prompt,
        mode: 'prompt-edit',
        originalContent: result.prompt,
        templateSource: templateDetail?.raw,
        templateName,
      } as any)
    } catch {
      // Generate a placeholder preview
      const slotSummary = Object.entries(values)
        .filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
        .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n')

      open({
        title: `/${command} @${module}`,
        content: `# ${command} ${module}\n\n${schema.description}\n\n## Slot Values\n${slotSummary || '(no values set)'}\n\n(API unavailable - showing placeholder)`,
        mode: 'prompt-edit',
        originalContent: `# ${command} ${module}\n\n${schema.description}\n\n## Slot Values\n${slotSummary || '(no values set)'}\n\n(API unavailable - showing placeholder)`,
      } as any)
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
        overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
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
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View template source">
            <IconButton size="small" onClick={handleViewTemplate} sx={{ color: 'text.secondary' }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={clearComposer} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
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
