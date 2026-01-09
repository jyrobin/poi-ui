import { Box, Typography, List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useDrawer } from '../hooks/useDrawer'

// Mock data for Phase 1
const mockSuggestions = [
  {
    command: '/fix',
    module: 'poi',
    score: 105,
    reason: 'Evaluation gaps detected',
    prompt: `# Fix Documentation Gaps

Review poi module and address the following evaluation gaps:

## Current Issues
- Architecture section missing diagram
- Key Types incomplete (5 of 12 exports documented)
- Boundary definitions unclear

## Context
\`\`\`yaml
module: poi
path: ~/ws/jyws/poi
type: cli-tool
\`\`\`

## Tasks
1. Update Architecture section with current structure
2. Document missing Key Types
3. Clarify module boundaries

Please review DESIGN.md and update accordingly.`,
  },
  {
    command: '/update',
    module: 'voiceturn',
    score: 100,
    reason: 'Code newer than docs',
    prompt: `# Update Documentation

Review voiceturn and update:
- DESIGN.md (architecture, refs)
- NOTES.md (gotchas, ops)

## Recent Changes
- src/handler.go modified 2 days ago
- New endpoints added

## Current DESIGN.md
Last updated: 5 days ago

Please ensure documentation reflects current implementation.`,
  },
  {
    command: '/bootstrap',
    module: 'new-svc',
    score: 85,
    reason: 'No documentation',
    prompt: `# Bootstrap Documentation

Create initial documentation for new-svc:

## Module Info
\`\`\`yaml
name: new-svc
path: ~/ws/jyws/new-svc
type: service
\`\`\`

## Tasks
1. Create DESIGN.md with Purpose, Architecture, Key Types
2. Create NOTES.md with operational notes
3. Register in workspace .poi.yaml

Use poi templates as reference.`,
  },
  {
    command: '/evaluate',
    module: 'cliq',
    score: 75,
    reason: 'Not evaluated recently',
    prompt: `# Evaluate Documentation

Perform shallow evaluation of cliq module.

## Evaluation Criteria
- Purpose Accuracy (0-1)
- Architecture Match (0-1)
- Key Types Coverage (%)
- Dependencies Accuracy (0-1)
- Boundary Clarity (A-F)

## Output
Write evaluation to .summary.yaml:
\`\`\`yaml
evaluation:
  purpose_accuracy: <score>
  architecture_match: <score>
  ...
  evaluated_at: <timestamp>
\`\`\``,
  },
]

export default function SuggestionsBlock() {
  const { open } = useDrawer()

  const handleClick = (suggestion: typeof mockSuggestions[0]) => {
    open({
      title: `${suggestion.command} ${suggestion.module}`,
      content: suggestion.prompt,
      mode: 'output',
    })
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
        {mockSuggestions.map((suggestion, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleClick(suggestion)}
            sx={{
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(124, 156, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <PlayArrowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
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
                    {suggestion.command}
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
