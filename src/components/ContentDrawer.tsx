import { Box, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useDrawer } from '../hooks/useDrawer'
import { DRAWER_MIN_WIDTH, DRAWER_MAX_WIDTH } from '../theme'
import MarkdownViewer from '../viewers/MarkdownViewer'

export default function ContentDrawer() {
  const { content, close } = useDrawer()

  const handleCopy = () => {
    if (content?.content) {
      navigator.clipboard.writeText(content.content)
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
        {content?.content ? (
          <MarkdownViewer content={content.content} />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No content selected
          </Typography>
        )}
      </Box>

      {/* Drawer actions */}
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
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Copy to Clipboard
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
    </Box>
  )
}
