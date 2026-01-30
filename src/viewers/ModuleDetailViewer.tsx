import { useState, useEffect } from 'react'
import { Box, Typography, Chip, Skeleton, Divider } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import { api } from '../api/client'

interface ModuleDetailViewerProps {
  moduleName: string
}

type ModuleStatus = 'ok' | 'stale' | 'missing'

interface ModuleDetail {
  name: string
  path: string
  status: ModuleStatus
  type: string
}

export default function ModuleDetailViewer({ moduleName }: ModuleDetailViewerProps) {
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    api.getModules()
      .then((modules) => {
        const found = modules.find((m) => m.name === moduleName)
        if (found) {
          setModule({
            name: found.name,
            path: found.path,
            status: found.status === 'stale' ? 'stale' : found.status === 'gap' ? 'missing' : 'ok',
            type: found.type || 'module',
          })
        } else {
          setModule({ name: moduleName, path: moduleName, status: 'missing', type: 'module' })
        }
      })
      .catch(() => {
        setModule({ name: moduleName, path: moduleName, status: 'missing', type: 'module' })
      })
      .finally(() => setLoading(false))
  }, [moduleName])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="text" width="40%" />
      </Box>
    )
  }

  if (error || !module) {
    return (
      <Typography color="error.main" variant="body2">
        {error || 'Module not found'}
      </Typography>
    )
  }

  const status: ModuleStatus = module.status || 'ok'

  const statusIconMap: Record<ModuleStatus, React.ReactElement> = {
    ok: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
    stale: <WarningAmberIcon sx={{ fontSize: 16 }} />,
    missing: <ErrorOutlineIcon sx={{ fontSize: 16 }} />,
  }

  const statusColorMap: Record<ModuleStatus, string> = {
    ok: 'success.main',
    stale: 'warning.main',
    missing: 'error.main',
  }

  const statusBgMap: Record<ModuleStatus, string> = {
    ok: 'rgba(63, 185, 80, 0.15)',
    stale: 'rgba(210, 153, 34, 0.15)',
    missing: 'rgba(248, 81, 73, 0.15)',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          @{module.name}
        </Typography>
        <Chip
          icon={statusIconMap[status]}
          label={status}
          size="small"
          sx={{
            bgcolor: statusBgMap[status],
            color: statusColorMap[status],
            '& .MuiChip-icon': { color: statusColorMap[status] },
          }}
        />
      </Box>

      {/* Path */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FolderOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {module.path}
        </Typography>
      </Box>

      {module.type && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Type:
          </Typography>
          <Chip
            label={module.type}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        </Box>
      )}

      <Divider />

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Use <code>poi bootstrap -m {module.name}</code> to generate documentation, or <code>poi evaluate -m {module.name}</code> to assess existing docs.
      </Typography>
    </Box>
  )
}
