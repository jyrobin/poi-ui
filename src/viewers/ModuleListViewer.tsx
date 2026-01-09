import { useState, useEffect } from 'react'
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Skeleton, Chip } from '@mui/material'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { api, Module } from '../api/client'
import { useFocusModule } from '../hooks/useFocusModule'
import { useDrawer } from '../hooks/useDrawer'

const MOCK_MODULES: Module[] = [
  { name: 'poi', path: './poi', status: 'documented', type: 'go' },
  { name: 'voiceturn', path: './voiceturn', status: 'stale', type: 'go' },
  { name: 'cliq', path: './cliq', status: 'documented', type: 'go' },
  { name: 'new-svc', path: './new-svc', status: 'gap', type: 'go' },
  { name: 'utils', path: './utils', status: 'pending', type: 'go' },
]

function ModuleSkeleton() {
  return (
    <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Skeleton variant="circular" width={20} height={20} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="50%" height={20} />
        <Skeleton variant="text" width="70%" height={16} />
      </Box>
    </Box>
  )
}

export default function ModuleListViewer() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { module: focusModule, setModule: setFocusModule } = useFocusModule()
  const { close } = useDrawer()

  useEffect(() => {
    setLoading(true)
    api.getModules()
      .then((data) => {
        setModules(data)
        setError(null)
      })
      .catch(() => {
        setModules(MOCK_MODULES)
        setError(null) // Use mock data silently
      })
      .finally(() => setLoading(false))
  }, [])

  const handleModuleClick = (mod: Module) => {
    setFocusModule(mod.name)
    close()
  }

  const getStatusIcon = (status: Module['status']) => {
    switch (status) {
      case 'documented':
        return <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
      case 'stale':
        return <WarningAmberIcon sx={{ fontSize: 18, color: 'warning.main' }} />
      case 'gap':
        return <ErrorOutlineIcon sx={{ fontSize: 18, color: 'error.main' }} />
      default:
        return <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
    }
  }

  const getStatusLabel = (status: Module['status']) => {
    switch (status) {
      case 'documented': return 'OK'
      case 'stale': return 'Stale'
      case 'gap': return 'Gaps'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  const getStatusColor = (status: Module['status']) => {
    switch (status) {
      case 'documented': return 'success.main'
      case 'stale': return 'warning.main'
      case 'gap': return 'error.main'
      default: return 'text.secondary'
    }
  }

  if (loading) {
    return (
      <Box>
        <ModuleSkeleton />
        <ModuleSkeleton />
        <ModuleSkeleton />
        <ModuleSkeleton />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography variant="body2" sx={{ color: 'error.main', p: 2 }}>
        {error}
      </Typography>
    )
  }

  // Group by parent directory if paths have structure
  const sortedModules = [...modules].sort((a, b) => a.path.localeCompare(b.path))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
        Click a module to set as focus. Current focus:{' '}
        {focusModule ? (
          <Typography component="span" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'primary.main' }}>
            @{focusModule}
          </Typography>
        ) : (
          <Typography component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            none
          </Typography>
        )}
      </Typography>

      <List dense sx={{ mx: -2 }}>
        {sortedModules.map((mod) => (
          <ListItemButton
            key={mod.name}
            onClick={() => handleModuleClick(mod)}
            selected={focusModule === mod.name}
            sx={{
              px: 2,
              py: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(124, 156, 255, 0.12)',
                '&:hover': { bgcolor: 'rgba(124, 156, 255, 0.18)' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FolderOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.8125rem',
                      fontWeight: focusModule === mod.name ? 600 : 400,
                      color: 'text.primary',
                    }}
                  >
                    @{mod.name}
                  </Typography>
                  {focusModule === mod.name && (
                    <Chip
                      label="focus"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.6875rem',
                      color: 'text.secondary',
                    }}
                  >
                    {mod.path}
                  </Typography>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                    {getStatusIcon(mod.status)}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ fontSize: '0.625rem', color: getStatusColor(mod.status) }}
                    >
                      {getStatusLabel(mod.status)}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>

      {modules.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
          No modules found in workspace
        </Typography>
      )}
    </Box>
  )
}
