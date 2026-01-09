import { Box, IconButton, Tooltip } from '@mui/material'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useDrawer } from '../hooks/useDrawer'
import { TOOLBAR_WIDTH } from '../theme'

export default function DrawerToolbar() {
  const { isOpen, toggle } = useDrawer()

  return (
    <Box
      sx={{
        width: TOOLBAR_WIDTH,
        minWidth: TOOLBAR_WIDTH,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
      }}
    >
      <Tooltip title="Content" placement="left">
        <IconButton
          size="small"
          onClick={toggle}
          sx={{
            color: isOpen ? 'primary.main' : 'text.secondary',
            bgcolor: isOpen ? 'rgba(124, 156, 255, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: isOpen ? 'rgba(124, 156, 255, 0.15)' : 'action.hover',
            },
          }}
        >
          <ArticleOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Module Info" placement="left">
        <IconButton
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
