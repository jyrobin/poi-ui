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
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import StorageIcon from '@mui/icons-material/Storage'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api, FragmentDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'

interface FragmentDetailViewerProps {
  fragmentName: string
}

export default function FragmentDetailViewer({ fragmentName }: FragmentDetailViewerProps) {
  const [fragment, setFragment] = useState<FragmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { open } = useDrawer()
  const mode = useThemeMode((s) => s.mode)
  const codeStyle = mode === 'dark' ? oneDark : oneLight

  useEffect(() => {
    const fetchFragment = async () => {
      try {
        setLoading(true)
        const data = await api.getFragment(fragmentName)
        setFragment(data)
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
    <Box>
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

      {/* Fragment source */}
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
        Fragment Source
      </Typography>
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
    </Box>
  )
}
