import { Box, Typography, IconButton, Collapse } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useSSEStore } from '../api/useSSE'

const ICON_MAP = {
  info: InfoOutlinedIcon,
  warning: WarningAmberIcon,
  error: ErrorOutlineIcon,
}

const COLOR_MAP = {
  info: 'primary.main',
  warning: 'warning.main',
  error: 'error.main',
}

const BG_MAP = {
  info: 'rgba(124, 156, 255, 0.1)',
  warning: 'rgba(210, 153, 34, 0.1)',
  error: 'rgba(248, 81, 73, 0.1)',
}

export default function NotificationBlock() {
  const { notifications, dismissNotification } = useSSEStore()

  if (notifications.length === 0) {
    return null
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      {notifications.map((notification) => {
        const Icon = ICON_MAP[notification.type]
        return (
          <Collapse key={notification.id} in={true}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: BG_MAP[notification.type],
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Icon
                sx={{
                  fontSize: 16,
                  color: COLOR_MAP[notification.type],
                  mt: 0.25,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  flex: 1,
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                }}
              >
                {notification.message}
              </Typography>
              <IconButton
                size="small"
                onClick={() => dismissNotification(notification.id)}
                sx={{
                  p: 0.25,
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Collapse>
        )
      })}
    </Box>
  )
}
