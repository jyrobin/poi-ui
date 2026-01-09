import { useState } from 'react'
import { Box, Typography, Menu, MenuItem, Chip, Divider } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import StatusBlock from '../blocks/StatusBlock'
import SuggestionsBlock from '../blocks/SuggestionsBlock'
import ComposerBlock from '../blocks/ComposerBlock'
import CommandInput from './CommandInput'
import { useThemeMode } from '../hooks/useThemeMode'

// Mock focus module for Phase 1
const focusModule = 'voiceturn'

export default function CommandPanel() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  const { mode, toggle: toggleTheme } = useThemeMode()

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
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
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
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

        {/* Focus module */}
        <Chip
          label={`@${focusModule}`}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.6875rem',
            bgcolor: 'rgba(124, 156, 255, 0.1)',
            color: 'primary.main',
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
        <ComposerBlock />
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
