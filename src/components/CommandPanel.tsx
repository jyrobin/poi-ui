import { useState } from 'react'
import { Box, Typography, Menu, MenuItem, Chip, Divider, Tooltip } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import AssessmentIcon from '@mui/icons-material/Assessment'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import CoverageIcon from '@mui/icons-material/DonutSmall'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import CategoryIcon from '@mui/icons-material/Category'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import StatusBlock from '../blocks/StatusBlock'
import SuggestionsBlock from '../blocks/SuggestionsBlock'
import CommandInput from './CommandInput'
import { useThemeMode } from '../hooks/useThemeMode'
import { usePollingStore } from '../api/usePolling'
import { useFocusModule } from '../hooks/useFocusModule'
import { useDrawer } from '../hooks/useDrawer'
import { useSessionDataStore } from '../api/usePolling'

export default function CommandPanel() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [reportsAnchorEl, setReportsAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  const reportsMenuOpen = Boolean(reportsAnchorEl)
  const { mode, toggle: toggleTheme } = useThemeMode()
  const connected = usePollingStore((s) => s.connected)
  const focusModule = useFocusModule((s) => s.module)
  const { open: openDrawer } = useDrawer()
  const workspace = useSessionDataStore((s) => s.workspace)
  const status = useSessionDataStore((s) => s.status)

  // Status dot color: gray=disconnected, green=connected, orange=needs collect
  const needsCollect = status?.flags?.needsCollect ?? false
  const dotColor = !connected ? 'text.secondary' : needsCollect ? 'warning.main' : 'success.main'
  const dotTooltip = !connected ? 'Disconnected' : needsCollect ? 'Docs updated - run collect' : 'Connected'

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleOpenModules = () => {
    openDrawer({
      title: 'Workspace Modules',
      content: '',
      mode: 'modules',
    })
    handleMenuClose()
  }

  const handleOpenRecipes = () => {
    openDrawer({
      title: 'Recipes',
      content: '',
      mode: 'recipes',
    })
    handleMenuClose()
  }

  const handleReportsClick = (event: React.MouseEvent<HTMLElement>) => {
    setReportsAnchorEl(event.currentTarget)
  }

  const handleReportsClose = () => {
    setReportsAnchorEl(null)
  }

  const openReport = (reportType: string, title: string) => {
    openDrawer({
      title,
      content: '',
      mode: 'report',
      reportType,
      moduleName: focusModule || undefined,
    })
    handleReportsClose()
    handleMenuClose()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand with dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            onClick={handleMenuClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              mx: -0.75,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              POI
            </Typography>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 18, color: 'text.secondary', ml: 0.25 }}
            />
          </Box>
          <Tooltip title={dotTooltip}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 8,
                  color: dotColor,
                  transition: 'color 0.3s ease',
                  ...(!connected && {
                    animation: 'blink 2s infinite',
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.2 },
                    },
                  }),
                  ...(connected && needsCollect && {
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                    },
                  }),
                }}
              />
              {workspace ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.625rem',
                    color: 'text.secondary',
                  }}
                >
                  {workspace}
                </Typography>
              ) : !connected ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.625rem',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  offline
                </Typography>
              ) : null}
            </Box>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={handleOpenModules} sx={{ gap: 1 }}>
            <ViewModuleOutlinedIcon fontSize="small" />
            Modules
          </MenuItem>
          <MenuItem onClick={handleOpenRecipes} sx={{ gap: 1 }}>
            <PlaylistPlayIcon fontSize="small" />
            Recipes
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleReportsClick} sx={{ gap: 1 }}>
            <AssessmentIcon fontSize="small" />
            Reports
            <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: 'auto' }} />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              toggleTheme()
              handleMenuClose()
            }}
            sx={{ gap: 1 }}
          >
            {mode === 'dark' ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>Help</MenuItem>
          <MenuItem onClick={handleMenuClose}>About</MenuItem>
        </Menu>

        {/* Reports Submenu */}
        <Menu
          anchorEl={reportsAnchorEl}
          open={reportsMenuOpen}
          onClose={handleReportsClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={() => openReport('session', 'Session Overview')} sx={{ gap: 1 }}>
            <AssessmentIcon fontSize="small" />
            Session
          </MenuItem>
          <MenuItem onClick={() => openReport('health', 'Health Check')} sx={{ gap: 1 }}>
            <HealthAndSafetyIcon fontSize="small" />
            Health
          </MenuItem>
          <MenuItem onClick={() => openReport('coverage', 'Coverage Report')} sx={{ gap: 1 }}>
            <CoverageIcon fontSize="small" />
            Coverage
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => openReport('deps', 'Dependencies')} sx={{ gap: 1 }}>
            <AccountTreeIcon fontSize="small" />
            Dependencies
          </MenuItem>
          <MenuItem onClick={() => openReport('tags', 'Tags')} sx={{ gap: 1 }}>
            <LocalOfferIcon fontSize="small" />
            Tags
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => openReport('gotchas', 'Gotchas')} sx={{ gap: 1 }}>
            <ReportProblemIcon fontSize="small" />
            Gotchas
          </MenuItem>
          <MenuItem onClick={() => openReport('entities', 'Entities')} sx={{ gap: 1 }}>
            <CategoryIcon fontSize="small" />
            Entities
          </MenuItem>
        </Menu>

        {/* Focus module */}
        <Chip
          label={focusModule ? `@${focusModule}` : 'no focus'}
          size="small"
          onClick={handleOpenModules}
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.6875rem',
            bgcolor: focusModule ? 'rgba(124, 156, 255, 0.1)' : 'transparent',
            color: focusModule ? 'primary.main' : 'text.secondary',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: focusModule ? 'rgba(124, 156, 255, 0.2)' : 'action.hover',
            },
          }}
        />
      </Box>

      {/* Content blocks */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <StatusBlock />
        <SuggestionsBlock />
      </Box>

      {/* Command input */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          p: 1.5,
        }}
      >
        <CommandInput />
      </Box>
    </Box>
  )
}
