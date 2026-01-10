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
import CodeIcon from '@mui/icons-material/Code'
import StorageIcon from '@mui/icons-material/Storage'
import SaveIcon from '@mui/icons-material/Save'
import RestoreIcon from '@mui/icons-material/Restore'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api, FragmentDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'

interface FragmentDetailViewerProps {
  fragmentName: string
}

type ViewMode = 'view' | 'edit'

export default function FragmentDetailViewer({ fragmentName }: FragmentDetailViewerProps) {
  const [fragment, setFragment] = useState<FragmentDetail | null>(null)
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
  const hasChanges = editContent !== fragment?.raw

  useEffect(() => {
    const fetchFragment = async () => {
      try {
        setLoading(true)
        const [data, builtin] = await Promise.all([
          api.getFragment(fragmentName),
          api.getBuiltinFragment(fragmentName),
        ])
        setFragment(data)
        setEditContent(data.raw)
        setBuiltinContent(builtin.exists ? builtin.content : null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fragment')
      } finally {
        setLoading(false)
      }
    }
    fetchFragment()
  }, [fragmentName])

  const handleBack = () => {
    open({
      title: 'Fragments',
      content: '',
      mode: 'fragments',
    })
  }

  const handleTemplateClick = (templateName: string) => {
    open({
      title: templateName,
      content: '',
      mode: 'template',
      templateName,
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
    if (!fragment) return

    setSaving(true)
    setValidationError(null)

    try {
      // Validate first
      const validation = await api.validateFragment(fragment.name, editContent)
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid fragment syntax')
        setSaving(false)
        return
      }

      // Save
      const result = await api.saveFragment(fragment.name, editContent)

      // Refresh fragment data
      const updatedFragment = await api.getFragment(fragmentName)
      setFragment(updatedFragment)

      setSnackbar({
        open: true,
        message: result.message,
        severity: 'success',
      })
      setViewMode('view')
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save fragment',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [fragment, editContent, fragmentName])

  const handleReset = useCallback(async () => {
    if (!fragment) return

    setSaving(true)
    try {
      await api.deleteFragment(fragment.name)

      // Refresh fragment data
      const updatedFragment = await api.getFragment(fragmentName)
      setFragment(updatedFragment)
      setEditContent(updatedFragment.raw)

      setSnackbar({
        open: true,
        message: 'Fragment reset to builtin',
        severity: 'success',
      })
      setViewMode('view')
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to reset fragment',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [fragment, fragmentName])

  const handleDiscardChanges = () => {
    if (fragment) {
      setEditContent(fragment.raw)
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

  if (!fragment) {
    return <Alert severity="warning">Fragment not found</Alert>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Tooltip title="Back to fragments">
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
          {fragment.name}
        </Typography>
        {fragment.required && (
          <Chip
            label="required"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'info.main',
              color: 'info.contrastText',
            }}
          />
        )}
        {fragment.isCustom && (
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
          label={fragment.category}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Box sx={{ flex: 1 }} />
        {/* Action buttons */}
        {fragment.isCustom && (
          <Tooltip title="Reset to builtin">
            <IconButton size="small" onClick={handleReset} disabled={saving}>
              <RestoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Description */}
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
        {fragment.description}
      </Typography>

      {/* Metadata */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label={`source: ${fragment.source}`}
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: '0.6875rem' }}
        />
        {fragment.condition && (
          <Chip
            label={`condition: ${fragment.condition}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.6875rem', fontFamily: '"JetBrains Mono", monospace' }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Used by templates */}
      {fragment.usedBy && fragment.usedBy.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CodeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Used By ({fragment.usedBy.length} templates)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {fragment.usedBy.map((tmpl) => (
              <Chip
                key={tmpl}
                label={tmpl}
                size="small"
                onClick={() => handleTemplateClick(tmpl)}
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
      {fragment.datasets && fragment.datasets.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Data Fields ({fragment.datasets.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {fragment.datasets.map((ds) => (
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

      {/* Fragment source - view or edit */}
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
              language="markdown"
              style={codeStyle}
              customStyle={{
                margin: 0,
                fontSize: '0.75rem',
                borderRadius: 0,
              }}
              showLineNumbers
            >
              {fragment.raw}
            </SyntaxHighlighter>
          </Paper>
        ) : (
          <TextField
            multiline
            fullWidth
            value={editContent}
            onChange={handleContentChange}
            placeholder="Enter fragment content..."
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
