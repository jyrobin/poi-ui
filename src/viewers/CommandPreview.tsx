import { Box, Typography, Divider, Chip, IconButton, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { CommandPreviewResponse } from '../api/client'
import MarkdownViewer from './MarkdownViewer'

interface CommandPreviewProps {
  preview: CommandPreviewResponse
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'k'
  }
  return String(n)
}

export default function CommandPreview({ preview }: CommandPreviewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(preview.fullText)
  }

  const commandLabel = preview.module
    ? `poi ${preview.command} -m ${preview.module}`
    : `poi ${preview.command}`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          {commandLabel}
        </Typography>
        <Tooltip title="Copy full text">
          <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary' }}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
          ~{formatNumber(preview.stats.estTokens)} tokens
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
          {formatNumber(preview.stats.wordCount)} words
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
          {preview.stats.lineCount} lines
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Sections */}
      {preview.sections.map((section, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          {/* Section header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: '1px',
                bgcolor: 'divider',
              }}
            />
            <Chip
              label={section.header}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.6875rem',
                height: 22,
                borderColor: sourceColor(section.source),
                color: sourceColor(section.source),
              }}
            />
            <Box
              sx={{
                flex: 1,
                height: '1px',
                bgcolor: 'divider',
              }}
            />
          </Box>

          {/* Section content */}
          <MarkdownViewer content={section.content} />
        </Box>
      ))}
    </Box>
  )
}

function sourceColor(source: string): string {
  switch (source) {
    case 'brief':
      return 'primary.main'
    case 'context':
      return 'success.main'
    case 'task':
      return 'warning.main'
    default:
      return 'text.secondary'
  }
}
