import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './theme'
import { useThemeMode } from './hooks/useThemeMode'
import { usePolling } from './api/usePolling'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import AppShell from './components/AppShell'

export default function App() {
  const mode = useThemeMode((s) => s.mode)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  // Poll /api/session every 15s (status, suggestions, workspace)
  usePolling(15000)

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  )
}
