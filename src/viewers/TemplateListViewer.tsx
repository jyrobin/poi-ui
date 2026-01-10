import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import { api, TemplateListItem } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'

export default function TemplateListViewer() {
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intentFilter, setIntentFilter] = useState<string>('all')
  const { open } = useDrawer()

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const response = await api.getTemplates()
        setTemplates(response.templates)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  // Get unique intents for tabs
  const intents = ['all', ...Array.from(new Set(templates.map((t) => t.intent)))]

  // Filter templates by intent
  const filteredTemplates =
    intentFilter === 'all'
      ? templates
      : templates.filter((t) => t.intent === intentFilter)

  const handleTemplateClick = (template: TemplateListItem) => {
    open({
      title: template.name,
      content: '',
      mode: 'template',
      templateName: template.name,
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

  return (
    <Box>
      {/* Intent tabs */}
      <Tabs
        value={intentFilter}
        onChange={(_, v) => setIntentFilter(v)}
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            px: 1.5,
            fontSize: '0.75rem',
            textTransform: 'none',
          },
        }}
      >
        {intents.map((intent) => (
          <Tab
            key={intent}
            value={intent}
            label={intent === 'all' ? 'All' : intent}
          />
        ))}
      </Tabs>

      {/* Template list */}
      <List dense sx={{ mx: -2 }}>
        {filteredTemplates.map((template) => (
          <ListItemButton
            key={template.name}
            onClick={() => handleTemplateClick(template)}
            sx={{
              px: 2,
              py: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <CodeIcon
              sx={{
                fontSize: 18,
                mr: 1.5,
                color: template.source === 'user' ? 'warning.main' : 'text.secondary',
              }}
            />
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {template.name}
                  </Typography>
                  {template.source === 'user' && (
                    <Chip
                      label="custom"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25,
                  }}
                >
                  {template.description}
                </Typography>
              }
            />
            <Chip
              label={template.intent}
              size="small"
              variant="outlined"
              sx={{
                ml: 1,
                height: 20,
                fontSize: '0.625rem',
                borderColor: 'divider',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {filteredTemplates.length === 0 && (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            py: 4,
          }}
        >
          No templates found
        </Typography>
      )}
    </Box>
  )
}
