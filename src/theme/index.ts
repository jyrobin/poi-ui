import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              main: '#7c9cff',
              light: '#a6bbff',
              dark: '#5a7ae0',
            },
            secondary: {
              main: '#81c784',
              light: '#a5d6a7',
              dark: '#66bb6a',
            },
            background: {
              default: '#0d1117',
              paper: '#161b22',
            },
            text: {
              primary: '#e6edf3',
              secondary: '#8b949e',
            },
            divider: '#30363d',
            error: {
              main: '#f85149',
            },
            warning: {
              main: '#d29922',
            },
            success: {
              main: '#3fb950',
            },
          }
        : {
            primary: {
              main: '#0969da',
              light: '#54aeff',
              dark: '#0550ae',
            },
            secondary: {
              main: '#2da44e',
              light: '#4ac26b',
              dark: '#1a7f37',
            },
            background: {
              default: '#f6f8fa',
              paper: '#ffffff',
            },
            text: {
              primary: '#1f2328',
              secondary: '#656d76',
            },
            divider: '#d0d7de',
            error: {
              main: '#cf222e',
            },
            warning: {
              main: '#9a6700',
            },
            success: {
              main: '#1a7f37',
            },
          }),
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 13,
      h6: {
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
      body1: {
        fontSize: '0.8125rem',
      },
      body2: {
        fontSize: '0.75rem',
      },
      caption: {
        fontSize: '0.6875rem',
        color: mode === 'dark' ? '#8b949e' : '#656d76',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            overflow: 'hidden',
          },
          '*': {
            boxSizing: 'border-box',
          },
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: mode === 'dark' ? '#161b22' : '#f6f8fa',
          },
          '::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#30363d' : '#d0d7de',
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: mode === 'dark' ? '#484f58' : '#afb8c1',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.75rem',
            borderRadius: 6,
          },
          sizeSmall: {
            padding: '4px 10px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontSize: '0.6875rem',
            height: 22,
          },
          sizeSmall: {
            height: 18,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
  })

export const PANEL_WIDTH = 350
export const DRAWER_MIN_WIDTH = 400
export const DRAWER_MAX_WIDTH = 600
export const TOOLBAR_WIDTH = 48

// Breakpoint where we switch from single-column to two-column layout
// ~700px so left panel (350px) is roughly half at the breakpoint
export const WIDE_BREAKPOINT_PX = 700
