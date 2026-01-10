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
import ExtensionIcon from '@mui/icons-material/Extension'
import StorageIcon from '@mui/icons-material/Storage'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api, TemplateDetail } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'

interface TemplateDetailViewerProps {
  templateName: string
}

export default function TemplateDetailViewer({ templateName }: TemplateDetailViewerProps) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { open } = useDrawer()
  const mode = useThemeMode((s) => s.mode)
  const codeStyle = mode === 'dark' ? oneDark : oneLight

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const data = await api.getTemplate(templateName)
        setTemplate(data)
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
    <Box>
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

      {/* Template source */}
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
        Template Source
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
    </Box>
  )
}
