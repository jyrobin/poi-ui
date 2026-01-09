import { Box, Drawer, useMediaQuery } from '@mui/material'
import CommandPanel from './CommandPanel'
import ContentDrawer from './ContentDrawer'
import DrawerToolbar from './DrawerToolbar'
import { useDrawer } from '../hooks/useDrawer'
import { PANEL_WIDTH, TOOLBAR_WIDTH, WIDE_BREAKPOINT_PX } from '../theme'

export default function AppShell() {
  const isWide = useMediaQuery(`(min-width: ${WIDE_BREAKPOINT_PX}px)`)
  const { isOpen, close } = useDrawer()

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Command Panel */}
      <Box
        sx={{
          width: isWide ? PANEL_WIDTH : `calc(100% - ${TOOLBAR_WIDTH}px)`,
          minWidth: isWide ? PANEL_WIDTH : 0,
          height: '100%',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CommandPanel />
      </Box>

      {/* Toolbar - always next to panel */}
      <DrawerToolbar />

      {/* Wide screen: inline drawer */}
      {isWide && isOpen && (
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ContentDrawer />
        </Box>
      )}

      {/* Narrow screen: overlay drawer */}
      {!isWide && (
        <Drawer
          anchor="right"
          open={isOpen}
          onClose={close}
          PaperProps={{
            sx: {
              // Full width on very narrow, capped at 500px for mid-range
              width: { xs: '100%', sm: '80%' },
              maxWidth: 500,
              bgcolor: 'background.default',
            },
          }}
        >
          <ContentDrawer />
        </Drawer>
      )}
    </Box>
  )
}
