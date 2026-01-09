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

    // Handle workspace-level commands that can be run via API
    if (suggestion.command === 'collect') {
      const { updateContent } = useDrawer.getState()
      open({
        title: '/collect',
        content: `# Collect\n\nThis updates \`.poi/modules.yaml\` with the latest module metadata from all registered modules.\n\n**What it does:**\n1. Scans for all registered modules (.poi.yaml)\n2. Extracts module info from .summary.yaml files\n3. Rebuilds tag index and dependency graph\n4. Updates .poi/modules.yaml\n\nClick **Run** to execute, or run manually:\n\n\`\`\`bash\npoi collect\n\`\`\``,
        mode: 'output',
        action: {
          label: 'Run',
          onClick: async () => {
            updateContent(`# Collect\n\n*Running...*`)
            try {
              const result = await api.runCollect()
              if (result.success) {
                const output = [
                  `# Collect`,
                  ``,
                  `**Success!** Collected ${result.modules} modules with ${result.tags} tags.`,
                  ``,
                  `## Modules:`,
                  ...result.messages,
                ].join('\n')
                updateContent(output)
              } else {
                updateContent(`# Collect\n\n**Error:** ${result.error}`)
              }
            } catch (err) {
              updateContent(`# Collect\n\n**Error:** ${err instanceof Error ? err.message : 'Failed to run collect'}`)
            }
          },
        },
      })
      setLoadingIndex(null)
      return
    }

    try {
      const result = await api.generatePrompt({
        command: suggestion.command,
        module: suggestion.module,
      })
      const title = suggestion.module
        ? `/${suggestion.command} @${suggestion.module}`
        : `/${suggestion.command}`
      open({
        title: result.title || title,
        content: result.prompt,
        mode: 'output',
      })
    } catch {
      // Fallback to a simple placeholder if API fails
      const title = suggestion.module
        ? `/${suggestion.command} @${suggestion.module}`
        : `/${suggestion.command}`
      open({
        title,
        content: `# ${suggestion.command}${suggestion.module ? ' ' + suggestion.module : ''}\n\n${suggestion.reason}\n\n(API unavailable - showing placeholder)`,
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
                  {suggestion.module ? (
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
                  ) : (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.6875rem',
                        color: 'text.secondary',
                        fontStyle: 'italic',
                      }}
                    >
                      workspace
                    </Typography>
                  )}
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
