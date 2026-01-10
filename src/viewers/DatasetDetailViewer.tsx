import { useEffect, useState } from 'react'
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
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import { api, DatasetDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'

interface DatasetDetailViewerProps {
  datasetName: string
}

export default function DatasetDetailViewer({ datasetName }: DatasetDetailViewerProps) {
  const [dataset, setDataset] = useState<DatasetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { open } = useDrawer()

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true)
        const data = await api.getDataset(datasetName)
        setDataset(data)
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
    <Box>
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

      {/* Sample data */}
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
