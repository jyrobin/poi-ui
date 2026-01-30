import { useState } from 'react'
import { Box, Typography, List, ListItemButton, ListItemText, ListItemIcon, CircularProgress, Skeleton } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useDrawer } from '../hooks/useDrawer'
import { useSuggestions } from '../hooks/useSuggestions'
import { useFocusModule } from '../hooks/useFocusModule'
import { api, Suggestion } from '../api/client'

function SuggestionSkeleton() {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="text" width="50%" height={16} />
    </Box>
  )
}

export default function SuggestionsBlock() {
  const { open } = useDrawer()
  const { suggestions, loading, error } = useSuggestions()
  const setFocusModule = useFocusModule((s) => s.setModule)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  const handleClick = async (suggestion: Suggestion, index: number) => {
    setLoadingIndex(index)

    // Set focus module when clicking a suggestion
    if (suggestion.module) {
      setFocusModule(suggestion.module)
    }

    try {
      // Preview the command expansion
      const preview = await api.previewCommand({
        command: suggestion.command,
        module: suggestion.module,
      })

      const title = suggestion.module
        ? `poi ${suggestion.command} -m ${suggestion.module}`
        : `poi ${suggestion.command}`

      open({
        title,
        content: '',
        mode: 'command-preview',
        commandPreview: preview,
      })
    } catch {
      // Fallback to simple placeholder
      const title = suggestion.module
        ? `poi ${suggestion.command} -m ${suggestion.module}`
        : `poi ${suggestion.command}`

      open({
        title,
        content: `# ${suggestion.command}${suggestion.module ? ' ' + suggestion.module : ''}\n\n${suggestion.reason}\n\n(API unavailable)`,
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
        {loading && (
          <>
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </>
        )}
        {error && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Failed to load suggestions
            </Typography>
          </Box>
        )}
        {!loading && !error && suggestions.map((suggestion, index) => (
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
                <Typography
                  component="span"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: 'primary.main',
                  }}
                >
                  poi {suggestion.command}
                  {suggestion.module ? (
                    <Box component="span" sx={{ color: 'text.primary' }}>
                      {' '}-m {suggestion.module}
                    </Box>
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.6875rem',
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        ml: 1,
                      }}
                    >
                      workspace
                    </Box>
                  )}
                </Typography>
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
