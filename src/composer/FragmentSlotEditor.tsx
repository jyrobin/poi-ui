import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RestoreIcon from '@mui/icons-material/Restore'
import CheckIcon from '@mui/icons-material/Check'
import CodeIcon from '@mui/icons-material/Code'
import ExtensionIcon from '@mui/icons-material/Extension'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MarkdownViewer from '../viewers/MarkdownViewer'
import { useDrawer, EditorTab } from '../hooks/useDrawer'
import { useComposer } from '../hooks/useComposer'
import { useThemeMode } from '../hooks/useThemeMode'
import { api, SlotDefinition } from '../api/client'

interface FragmentSlotEditorProps {
  slot: SlotDefinition
  onDone?: () => void
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

export default function FragmentSlotEditor({ slot, onDone: _onDone }: FragmentSlotEditorProps) {
  void _onDone // Reserved for future use
  const { editorTab, setEditorTab, open } = useDrawer()
  const { values, setSlotValue, module, overrides, setOverride, clearOverride } = useComposer()
  const themeMode = useThemeMode((s) => s.mode)
  const codeStyle = themeMode === 'dark' ? oneDark : oneLight

  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [renderedContent, setRenderedContent] = useState('')
  const [templateSource, setTemplateSource] = useState('')
  const [fragmentDescription, setFragmentDescription] = useState('')

  const fragmentName = slot.fragment || slot.name
  const isEnabled = values[slot.name] !== false // Default to enabled

  // Check if there's an override in composer state
  const existingOverride = overrides[slot.name]
  const hasEdits = existingOverride !== undefined

  // Fetch fragment details and render preview with module context
  useEffect(() => {
    async function fetchFragment() {
      setLoading(true)
      try {
        // Fetch fragment detail and preview in parallel
        const [detail, preview] = await Promise.all([
          api.getFragment(fragmentName),
          api.previewFragment(fragmentName, { module: module || undefined }),
        ])

        setTemplateSource(detail.raw)
        setFragmentDescription(detail.description)

        if (preview.rendered) {
          setRenderedContent(preview.rendered)
        } else if (preview.error) {
          setRenderedContent(`Error rendering fragment: ${preview.error}`)
        } else {
          setRenderedContent(`# ${fragmentName}\n\n${detail.description}`)
        }
      } catch (err) {
        setRenderedContent(`Error loading fragment: ${fragmentName}`)
        setTemplateSource('')
      } finally {
        setLoading(false)
      }
    }
    fetchFragment()
  }, [fragmentName, module])

  // Use override if available, otherwise use rendered content
  const displayContent = existingOverride ?? renderedContent

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: EditorTab) => {
    setEditorTab(newValue)
  }, [setEditorTab])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Save edit to composer overrides
    setOverride(slot.name, e.target.value)
  }, [slot.name, setOverride])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayContent])

  const handleReset = useCallback(() => {
    // Clear the override from composer state
    clearOverride(slot.name)
  }, [slot.name, clearOverride])

  const handleToggle = useCallback(() => {
    setSlotValue(slot.name, !isEnabled)
  }, [slot.name, isEnabled, setSlotValue])

  // Stats for the current content
  const stats = useMemo(() => {
    const chars = displayContent.length
    const words = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0
    const lines = displayContent.split('\n').length
    const tokens = estimateTokens(displayContent)
    return { chars, words, lines, tokens }
  }, [displayContent])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading fragment...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Fragment info header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <ExtensionIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
        <Chip
          label={fragmentName}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.6875rem',
            bgcolor: 'rgba(156, 39, 176, 0.08)',
            color: '#9c27b0',
          }}
        />
        <Box sx={{ flex: 1 }} />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={isEnabled}
              onChange={handleToggle}
              disabled={slot.required}
            />
          }
          label={
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {isEnabled ? 'Included' : 'Excluded'}
            </Typography>
          }
          sx={{ mr: 0 }}
        />
      </Box>

      {/* Description */}
      {fragmentDescription && (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}
        >
          {fragmentDescription}
        </Typography>
      )}

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
          <Tab
            label="Template"
            value="template"
            icon={<CodeIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            sx={{ minHeight: 36 }}
          />
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
        {!isEnabled && (
          <Chip
            label="excluded"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              bgcolor: 'text.disabled',
              color: 'background.paper',
            }}
          />
        )}
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, overflow: 'auto', opacity: isEnabled ? 1 : 0.5 }}>
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
        ) : editorTab === 'template' ? (
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
              <Tooltip title="Open fragment editor">
                <Chip
                  label={fragmentName}
                  size="small"
                  icon={<ExtensionIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    open({
                      title: fragmentName,
                      content: '',
                      mode: 'fragment',
                      fragmentName,
                    })
                  }}
                  sx={{
                    fontSize: '0.6875rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    cursor: 'pointer',
                    bgcolor: 'rgba(156, 39, 176, 0.08)',
                    color: '#9c27b0',
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
              {templateSource || '# No template source available'}
            </SyntaxHighlighter>
          </Paper>
        ) : (
          <TextField
            multiline
            fullWidth
            value={displayContent}
            onChange={handleContentChange}
            placeholder="Edit fragment content..."
            disabled={!isEnabled}
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
