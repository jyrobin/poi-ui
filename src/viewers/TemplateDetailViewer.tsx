import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExtensionIcon from '@mui/icons-material/Extension'
import StorageIcon from '@mui/icons-material/Storage'
import SaveIcon from '@mui/icons-material/Save'
import RestoreIcon from '@mui/icons-material/Restore'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api, TemplateDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'

interface TemplateDetailViewerProps {
  templateName: string
}

type ViewMode = 'view' | 'edit'

export default function TemplateDetailViewer({ templateName }: TemplateDetailViewerProps) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('view')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  // Builtin content stored for potential future diff view
  const [_builtinContent, setBuiltinContent] = useState<string | null>(null)
  void _builtinContent // Reserved for future diff functionality

  const { open } = useDrawer()
  const mode = useThemeMode((s) => s.mode)
  const codeStyle = mode === 'dark' ? oneDark : oneLight

  // Check if content has been modified
  const hasChanges = editContent !== template?.raw

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const [data, builtin] = await Promise.all([
          api.getTemplate(templateName),
          api.getBuiltinTemplate(templateName),
        ])
        setTemplate(data)
        setEditContent(data.raw)
        setBuiltinContent(builtin.exists ? builtin.content : null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [templateName])

  const handleBack = () => {
    open({
      title: 'Templates',
      content: '',
      mode: 'templates',
    })
  }

  const handleFragmentClick = (fragmentName: string) => {
    open({
      title: fragmentName,
      content: '',
      mode: 'fragment',
      fragmentName,
    })
  }

  const handleViewModeChange = (_: React.SyntheticEvent, newMode: ViewMode) => {
    setViewMode(newMode)
    setValidationError(null)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value)
    setValidationError(null)
  }

  const handleSave = useCallback(async () => {
    if (!template) return

    setSaving(true)
    setValidationError(null)

    try {
      // Validate first
      const validation = await api.validateTemplate(template.name, editContent)
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid template syntax')
        setSaving(false)
        return
      }

      // Save
      const result = await api.saveTemplate(template.name, editContent)

      // Refresh template data
      const updatedTemplate = await api.getTemplate(templateName)
      setTemplate(updatedTemplate)

      setSnackbar({
        open: true,
        message: result.message,
        severity: 'success',
      })
      setViewMode('view')
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save template',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [template, editContent, templateName])

  const handleReset = useCallback(async () => {
    if (!template) return

    setSaving(true)
    try {
      await api.resetTemplate(template.name)

      // Refresh template data
      const updatedTemplate = await api.getTemplate(templateName)
      setTemplate(updatedTemplate)
      setEditContent(updatedTemplate.raw)

      setSnackbar({
        open: true,
        message: 'Template reset to builtin',
        severity: 'success',
      })
      setViewMode('view')
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to reset template',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [template, templateName])

  const handleDiscardChanges = () => {
    if (template) {
      setEditContent(template.raw)
      setValidationError(null)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }))
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!template) {
    return <Alert severity="warning">Template not found</Alert>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Tooltip title="Back to templates">
          <IconButton size="small" onClick={handleBack}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {template.name}
        </Typography>
        {template.isCustom && (
          <Chip
            label="custom"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
            }}
          />
        )}
        <Chip
          label={template.intent}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Box sx={{ flex: 1 }} />
        {/* Action buttons */}
        {template.isCustom && (
          <Tooltip title="Reset to builtin">
            <IconButton size="small" onClick={handleReset} disabled={saving}>
              <RestoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Description */}
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
        {template.description}
      </Typography>

      {/* Metadata */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label={`source: ${template.source}`}
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: '0.6875rem' }}
        />
        {template.params && template.params.length > 0 && (
          <Chip
            label={`params: ${template.params.join(', ')}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.6875rem' }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Fragments used */}
      {template.fragments && template.fragments.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ExtensionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Fragments ({template.fragments.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {template.fragments.map((frag) => (
              <Chip
                key={frag}
                label={frag}
                size="small"
                onClick={() => handleFragmentClick(frag)}
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Datasets referenced */}
      {template.datasets && template.datasets.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Data Fields ({template.datasets.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {template.datasets.map((ds) => (
              <Chip
                key={ds}
                label={ds}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* View/Edit tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          sx={{
            minHeight: 32,
            '& .MuiTab-root': {
              minHeight: 32,
              py: 0.5,
              fontSize: '0.75rem',
              textTransform: 'none',
            },
          }}
        >
          <Tab
            label="View"
            value="view"
            icon={<VisibilityIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
          />
          <Tab
            label="Edit"
            value="edit"
            icon={<EditIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
          />
        </Tabs>
        {viewMode === 'edit' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasChanges && (
              <Button
                size="small"
                variant="text"
                onClick={handleDiscardChanges}
                sx={{ fontSize: '0.75rem', textTransform: 'none' }}
              >
                Discard
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              sx={{ fontSize: '0.75rem', textTransform: 'none' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Validation error */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 1, py: 0.5, fontSize: '0.75rem' }}>
          {validationError}
        </Alert>
      )}

      {/* Template source - view or edit */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {viewMode === 'view' ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <SyntaxHighlighter
              language="django"
              style={codeStyle}
              customStyle={{
                margin: 0,
                fontSize: '0.75rem',
                borderRadius: 0,
              }}
              showLineNumbers
            >
              {template.raw}
            </SyntaxHighlighter>
          </Paper>
        ) : (
          <TextField
            multiline
            fullWidth
            value={editContent}
            onChange={handleContentChange}
            placeholder="Enter template content..."
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8125rem',
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              },
            }}
          />
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
