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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api, DatasetDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'

interface DatasetDetailViewerProps {
  datasetName: string
}

type ViewMode = 'view' | 'edit'

export default function DatasetDetailViewer({ datasetName }: DatasetDetailViewerProps) {
  const [dataset, setDataset] = useState<DatasetDetail | null>(null)
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

  const { open } = useDrawer()
  const mode = useThemeMode((s) => s.mode)
  const codeStyle = mode === 'dark' ? oneDark : oneLight

  // Check if content has been modified
  const hasChanges = editContent !== (dataset?.raw || '')

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true)
        const data = await api.getDataset(datasetName)
        setDataset(data)
        setEditContent(data.raw || '')
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset')
      } finally {
        setLoading(false)
      }
    }
    fetchDataset()
  }, [datasetName])

  const handleBack = () => {
    open({
      title: 'Datasets',
      content: '',
      mode: 'datasets',
    })
  }

  const handleTemplateClick = (name: string) => {
    open({
      title: name,
      content: '',
      mode: 'template',
      templateName: name,
    })
  }

  const handleFragmentClick = (name: string) => {
    open({
      title: name,
      content: '',
      mode: 'fragment',
      fragmentName: name,
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
    if (!dataset) return

    setSaving(true)
    setValidationError(null)

    try {
      // Validate first
      const validation = await api.validateDataset(editContent)
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid YAML syntax')
        setSaving(false)
        return
      }

      // Save
      const result = await api.saveDataset(dataset.name, editContent)

      // Refresh dataset data
      const updatedDataset = await api.getDataset(datasetName)
      setDataset(updatedDataset)

      setSnackbar({
        open: true,
        message: result.message,
        severity: 'success',
      })
      setViewMode('view')
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save dataset',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [dataset, editContent, datasetName])

  const handleDelete = useCallback(async () => {
    if (!dataset) return

    if (!confirm(`Delete dataset "${dataset.name}"? This cannot be undone.`)) {
      return
    }

    setSaving(true)
    try {
      await api.deleteDataset(dataset.name)

      setSnackbar({
        open: true,
        message: 'Dataset deleted',
        severity: 'success',
      })

      // Navigate back to datasets list
      handleBack()
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete dataset',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }, [dataset])

  const handleDiscardChanges = () => {
    if (dataset?.raw) {
      setEditContent(dataset.raw)
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

  if (!dataset) {
    return <Alert severity="warning">Dataset not found</Alert>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Tooltip title="Back to datasets">
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
          {dataset.name}
        </Typography>
        {dataset.isCustom && (
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
        {dataset.dynamic && (
          <Chip
            label="dynamic"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'info.main',
              color: 'info.contrastText',
            }}
          />
        )}
        <Chip
          label={dataset.type}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Box sx={{ flex: 1 }} />
        {/* Delete button for custom datasets */}
        {dataset.isCustom && (
          <Tooltip title="Delete dataset">
            <IconButton size="small" onClick={handleDelete} disabled={saving}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Description */}
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
        {dataset.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Fields */}
      {dataset.fields && dataset.fields.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
            Available Fields
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {dataset.fields.map((field) => (
              <Chip
                key={field}
                label={field}
                size="small"
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

      {/* Used by */}
      {dataset.usedBy && dataset.usedBy.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CodeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Used By ({dataset.usedBy.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {dataset.usedBy.map((name) => (
              <Chip
                key={name}
                label={name}
                size="small"
                onClick={() => {
                  // Determine if it's a template or fragment by name pattern
                  if (name.startsWith('section-') || name.startsWith('context-') || name.startsWith('output-')) {
                    handleFragmentClick(name)
                  } else {
                    handleTemplateClick(name)
                  }
                }}
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

      <Divider sx={{ my: 2 }} />

      {/* Custom dataset: View/Edit tabs */}
      {dataset.isCustom ? (
        <>
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

          {/* Content view or edit */}
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
                  language="yaml"
                  style={codeStyle}
                  customStyle={{
                    margin: 0,
                    fontSize: '0.75rem',
                    borderRadius: 0,
                  }}
                  showLineNumbers
                >
                  {dataset.raw || ''}
                </SyntaxHighlighter>
              </Paper>
            ) : (
              <TextField
                multiline
                fullWidth
                value={editContent}
                onChange={handleContentChange}
                placeholder="Enter dataset YAML..."
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
        </>
      ) : (
        /* Builtin dataset: Sample data only */
        <>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
            Sample Data
          </Typography>
          {dataset.sample ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                overflow: 'auto',
                border: 1,
                borderColor: 'divider',
                p: 1.5,
              }}
            >
              {renderSampleData(dataset.sample)}
            </Paper>
          ) : (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontStyle: 'italic' }}>
              No sample data available
            </Typography>
          )}
        </>
      )}

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

// Render sample data as a simple table or JSON
function renderSampleData(sample: Record<string, unknown>) {
  // Handle note for dynamic datasets
  if (sample.note && typeof sample.note === 'string') {
    return (
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontStyle: 'italic' }}>
        {sample.note}
      </Typography>
    )
  }

  // Handle array data (like modules or tags)
  const arrayKeys = Object.keys(sample).filter((k) => Array.isArray(sample[k]))
  if (arrayKeys.length > 0) {
    const key = arrayKeys[0]
    const items = sample[key] as Record<string, unknown>[]
    if (items.length === 0) {
      return (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
          No items
        </Typography>
      )
    }

    const columns = Object.keys(items[0])
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col}
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: '"JetBrains Mono", monospace',
                  py: 0.5,
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontSize: '0.6875rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    py: 0.5,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatValue(item[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Fallback: show as JSON
  return (
    <Typography
      component="pre"
      sx={{
        fontSize: '0.6875rem',
        fontFamily: '"JetBrains Mono", monospace',
        m: 0,
        whiteSpace: 'pre-wrap',
      }}
    >
      {JSON.stringify(sample, null, 2)}
    </Typography>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
