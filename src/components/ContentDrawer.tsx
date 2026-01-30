import { useState } from 'react'
import { Box, Typography, IconButton, Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useDrawer } from '../hooks/useDrawer'
import { DRAWER_MIN_WIDTH, DRAWER_MAX_WIDTH } from '../theme'
import MarkdownViewer from '../viewers/MarkdownViewer'
import ModuleDetailViewer from '../viewers/ModuleDetailViewer'
import ModuleListViewer from '../viewers/ModuleListViewer'
import ReportViewer, { type ReportType } from '../viewers/ReportViewer'
import CommandPreview from '../viewers/CommandPreview'
import RecipesViewer from '../viewers/RecipesViewer'

export default function ContentDrawer() {
  const { content, close } = useDrawer()
  const [actionLoading, setActionLoading] = useState(false)

  const handleAction = async () => {
    if (content?.action) {
      setActionLoading(true)
      try {
        await content.action.onClick()
      } finally {
        setActionLoading(false)
      }
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: { md: DRAWER_MIN_WIDTH },
        maxWidth: { md: DRAWER_MAX_WIDTH },
        height: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      {/* Drawer header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {content?.title || 'Content'}
        </Typography>
        <IconButton size="small" onClick={close} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Drawer content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {content?.mode === 'modules' ? (
          <ModuleListViewer />
        ) : content?.mode === 'module' && content.moduleName ? (
          <ModuleDetailViewer moduleName={content.moduleName} />
        ) : content?.mode === 'report' && content.reportType ? (
          <ReportViewer reportType={content.reportType as ReportType} module={content.moduleName} />
        ) : content?.mode === 'command-preview' && content.commandPreview ? (
          <CommandPreview preview={content.commandPreview} />
        ) : content?.mode === 'recipes' ? (
          <RecipesViewer />
        ) : content?.mode === 'output' && content?.content ? (
          <MarkdownViewer content={content.content} />
        ) : content?.content ? (
          <MarkdownViewer content={content.content} />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No content selected
          </Typography>
        )}
      </Box>

      {/* Drawer actions */}
      {content?.mode === 'output' && content?.action && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleAction}
            disabled={actionLoading}
            sx={{
              '&:hover': { bgcolor: 'success.dark' },
            }}
          >
            {content.action.label}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={close}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'transparent' },
            }}
          >
            Close
          </Button>
        </Box>
      )}
    </Box>
  )
}
