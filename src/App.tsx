import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './theme'
import { useThemeMode } from './hooks/useThemeMode'
import { useSSE } from './api/useSSE'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useWorkspace } from './hooks/useWorkspace'
import AppShell from './components/AppShell'

export default function App() {
  const mode = useThemeMode((s) => s.mode)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  // Fetch workspace info on startup
  useWorkspace()

  // Start SSE connection (status updates handled by useStatus hook)
  useSSE()

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  )
}
