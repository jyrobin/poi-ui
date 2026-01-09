import { useState } from 'react'
import { Box, Typography, List, ListItemButton, ListItemText, ListItemIcon, CircularProgress } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useDrawer } from '../hooks/useDrawer'
import { useSuggestions } from '../hooks/useSuggestions'
import { api, Suggestion } from '../api/client'

export default function SuggestionsBlock() {
  const { open } = useDrawer()
  const { suggestions } = useSuggestions()
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  const handleClick = async (suggestion: Suggestion, index: number) => {
    setLoadingIndex(index)
    try {
      const result = await api.generatePrompt({
        command: suggestion.command,
        module: suggestion.module,
      })
      open({
        title: result.title || `/${suggestion.command} @${suggestion.module}`,
        content: result.prompt,
        mode: 'output',
      })
    } catch {
      // Fallback to a simple placeholder if API fails
      open({
        title: `/${suggestion.command} @${suggestion.module}`,
        content: `# ${suggestion.command} ${suggestion.module}\n\n${suggestion.reason}\n\n(API unavailable - showing placeholder)`,
        mode: 'output',
      })
    } finally {
      setLoadingIndex(null)
    }
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500,
          }}
        >
          Suggested
        </Typography>
      </Box>

      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {suggestions.map((suggestion, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleClick(suggestion, index)}
            disabled={loadingIndex !== null}
            sx={{
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(124, 156, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {loadingIndex === index ? (
                <CircularProgress size={14} sx={{ color: 'primary.main' }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.75rem',
                      color: 'primary.main',
                    }}
                  >
                    /{suggestion.command}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.75rem',
                      color: 'text.primary',
                    }}
                  >
                    @{suggestion.module}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.6875rem',
                      color: 'text.secondary',
                      ml: 'auto',
                    }}
                  >
                    {suggestion.score}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}
                >
                  {suggestion.reason}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
