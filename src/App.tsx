import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './theme'
import { useThemeMode } from './hooks/useThemeMode'
import { useSSE } from './api/useSSE'
import { useStatusStore } from './hooks/useStatus'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import AppShell from './components/AppShell'

export default function App() {
  const mode = useThemeMode((s) => s.mode)
  const theme = useMemo(() => createAppTheme(mode), [mode])
  const updateFromSSE = useStatusStore((s) => s.updateFromSSE)

  // Start SSE connection
  useSSE({
    onStatusChanged: (event) => {
      updateFromSSE(event)
    },
  })

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  )
}
