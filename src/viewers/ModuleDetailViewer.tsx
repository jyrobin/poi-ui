import { useState, useEffect } from 'react'
import { Box, Typography, Chip, Skeleton, Divider } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { api, ModuleInfo } from '../api/client'

interface ModuleDetailViewerProps {
  moduleName: string
}

type ModuleStatus = 'ok' | 'stale' | 'missing'

const MOCK_MODULE: ModuleInfo = {
  name: 'voiceturn',
  path: './voiceturn',
  status: 'stale',
  documented: true,
  files: ['voiceturn/main.go', 'voiceturn/handler.go', 'voiceturn/service.go'],
  designPath: 'voiceturn/DESIGN.md',
  notesPath: 'voiceturn/NOTES.md',
}

export default function ModuleDetailViewer({ moduleName }: ModuleDetailViewerProps) {
  const [module, setModule] = useState<ModuleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    api.getModules()
      .then((modules) => {
        const found = modules.find((m) => m.name === moduleName)
        if (found) {
          // Convert Module to ModuleInfo
          setModule({
            name: found.name,
            path: found.path,
            status: found.status === 'stale' ? 'stale' : found.status === 'gap' ? 'missing' : 'ok',
            documented: found.status === 'documented',
          })
        } else {
          setModule({ ...MOCK_MODULE, name: moduleName })
        }
      })
      .catch(() => {
        // Use mock data on error
        setModule({ ...MOCK_MODULE, name: moduleName })
      })
      .finally(() => setLoading(false))
  }, [moduleName])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
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

  const statusIcon = statusIconMap[status]
  const statusColor = statusColorMap[status]
  const statusBg = statusBgMap[status]

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
          icon={statusIcon}
          label={module.status || 'ok'}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            '& .MuiChip-icon': { color: statusColor },
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

      <Divider />

      {/* Documentation files */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontSize: '0.8125rem' }}>
          Documentation
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {module.designPath && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'primary.main',
                }}
              >
                {module.designPath}
              </Typography>
            </Box>
          )}
          {module.notesPath && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'primary.main',
                }}
              >
                {module.notesPath}
              </Typography>
            </Box>
          )}
          {!module.designPath && !module.notesPath && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No documentation files
            </Typography>
          )}
        </Box>
      </Box>

      {/* Source files */}
      {module.files && module.files.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontSize: '0.8125rem' }}>
            Source Files ({module.files.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {module.files.slice(0, 10).map((file) => (
              <Typography
                key={file}
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.6875rem',
                  color: 'text.secondary',
                }}
              >
                {file}
              </Typography>
            ))}
            {module.files.length > 10 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                ...and {module.files.length - 10} more
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}
