import { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  Chip,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RestoreIcon from '@mui/icons-material/Restore'
import CheckIcon from '@mui/icons-material/Check'
import CodeIcon from '@mui/icons-material/Code'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MarkdownViewer from './MarkdownViewer'
import { useDrawer, EditorTab } from '../hooks/useDrawer'
import { useThemeMode } from '../hooks/useThemeMode'
import type { TokenStats } from '../api/client'

interface PromptEditorProps {
  content: string
  originalContent?: string
  templateSource?: string
  templateName?: string
  serverStats?: TokenStats // Server-provided stats (more accurate)
  onCopy?: (content: string) => void
}

// Simple token estimation: ~4 chars per token for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return n.toString()
}

export default function PromptEditor({
  content,
  originalContent,
  templateSource,
  templateName,
  serverStats,
  onCopy,
}: PromptEditorProps) {
  const {
    editorTab,
    setEditorTab,
    editedContent,
    setEditedContent,
    resetEdits,
    open,
  } = useDrawer()
  const themeMode = useThemeMode((s) => s.mode)
  const codeStyle = themeMode === 'dark' ? oneDark : oneLight

  const [copied, setCopied] = useState(false)

  // Use edited content if available, otherwise use passed content
  const displayContent = editedContent ?? content
  const hasEdits = editedContent !== null && editedContent !== (originalContent ?? content)

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: EditorTab) => {
    setEditorTab(newValue)
  }, [setEditorTab])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
  }, [setEditedContent])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(displayContent)
  }, [displayContent, onCopy])

  const handleReset = useCallback(() => {
    resetEdits()
  }, [resetEdits])

  // Stats for the current content
  // Use server stats if available and content hasn't been edited
  const stats = useMemo(() => {
    // If we have server stats and content hasn't been edited, use them
    if (serverStats && !hasEdits) {
      return {
        chars: serverStats.charCount,
        words: serverStats.wordCount,
        lines: serverStats.lineCount,
        tokens: serverStats.estTokens,
      }
    }
    // Otherwise calculate locally
    const chars = displayContent.length
    const words = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0
    const lines = displayContent.split('\n').length
    const tokens = estimateTokens(displayContent)
    return { chars, words, lines, tokens }
  }, [displayContent, serverStats, hasEdits])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab header with actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1,
        }}
      >
        <Tabs
          value={editorTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              fontSize: '0.75rem',
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Preview" value="preview" />
          <Tab label="Edit" value="edit" />
          {templateSource && (
            <Tab
              label="Template"
              value="template"
              icon={<CodeIcon sx={{ fontSize: 14 }} />}
              iconPosition="start"
              sx={{ minHeight: 36 }}
            />
          )}
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {hasEdits && (
            <Tooltip title="Reset to original">
              <IconButton size="small" onClick={handleReset}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? (
                <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Template info */}
      {templateName && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <CodeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Chip
            label={templateName}
            size="small"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.6875rem',
              bgcolor: 'rgba(124, 156, 255, 0.1)',
              color: 'primary.main',
            }}
          />
        </Box>
      )}

      {/* Stats bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          label={`${formatNumber(stats.chars)} chars`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Chip
          label={`${formatNumber(stats.words)} words`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Chip
          label={`${stats.lines} lines`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.625rem' }}
        />
        <Tooltip title="Estimated tokens (~4 chars/token)">
          <Chip
            label={`~${formatNumber(stats.tokens)} tokens`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          />
        </Tooltip>
        {hasEdits && (
          <Chip
            label="edited"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
            }}
          />
        )}
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {editorTab === 'preview' ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              overflow: 'auto',
              bgcolor: 'background.default',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <MarkdownViewer content={displayContent} />
          </Paper>
        ) : editorTab === 'template' && templateSource ? (
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              overflow: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Tooltip title="Open template editor">
                <Chip
                  label={templateName || 'template'}
                  size="small"
                  icon={<CodeIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    if (templateName) {
                      open({
                        title: templateName,
                        content: '',
                        mode: 'template',
                        templateName,
                      })
                    }
                  }}
                  sx={{
                    fontSize: '0.6875rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            </Box>
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
              {templateSource}
            </SyntaxHighlighter>
          </Paper>
        ) : (
          <TextField
            multiline
            fullWidth
            value={displayContent}
            onChange={handleContentChange}
            placeholder="Enter prompt content..."
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
    </Box>
  )
}
