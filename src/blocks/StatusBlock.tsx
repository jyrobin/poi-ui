import { Box, Typography, Chip, LinearProgress, Link, Skeleton } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useStatus } from '../hooks/useStatus'
import { useDrawer } from '../hooks/useDrawer'

export default function StatusBlock() {
  const { status, loading, error } = useStatus()
  const { open } = useDrawer()
  const coverage = status.total > 0 ? Math.round((status.documented / status.total) * 100) : 0
  const hasIssues = status.stale.length > 0 || status.gaps.length > 0

  const handleModuleClick = (moduleName: string) => {
    open({
      title: `@${moduleName}`,
      content: '',
      mode: 'module',
      moduleName,
    })
  }

  if (loading) {
    return (
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton variant="text" width={150} height={20} />
            <Skeleton variant="text" width={40} height={20} />
          </Box>
          <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3 }} />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Skeleton variant="rounded" width={100} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          Failed to load status: {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {/* Coverage bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            Documentation Coverage
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {status.documented}/{status.total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={coverage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'divider',
            '& .MuiLinearProgress-bar': {
              bgcolor: coverage >= 80 ? 'success.main' : coverage >= 60 ? 'warning.main' : 'error.main',
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Status chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        <Chip
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
          label={`${status.documented} documented`}
          size="small"
          sx={{
            bgcolor: 'rgba(63, 185, 80, 0.15)',
            color: 'success.main',
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />
        {status.stale.length > 0 && (
          <Chip
            icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
            label={`${status.stale.length} stale`}
            size="small"
            sx={{
              bgcolor: 'rgba(210, 153, 34, 0.15)',
              color: 'warning.main',
              '& .MuiChip-icon': { color: 'warning.main' },
            }}
          />
        )}
        {status.gaps.length > 0 && (
          <Chip
            icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
            label={`${status.gaps.length} gaps`}
            size="small"
            sx={{
              bgcolor: 'rgba(248, 81, 73, 0.15)',
              color: 'error.main',
              '& .MuiChip-icon': { color: 'error.main' },
            }}
          />
        )}
        {status.pending.length > 0 && (
          <Chip
            label={`${status.pending.length} pending`}
            size="small"
            sx={{
              bgcolor: 'rgba(139, 148, 158, 0.15)',
              color: 'text.secondary',
            }}
          />
        )}
      </Box>

      {/* Issue list */}
      {hasIssues && (
        <Box sx={{ mt: 1.5 }}>
          {status.stale.map((mod) => (
            <Typography
              key={mod}
              variant="caption"
              sx={{
                display: 'block',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              <Link
                component="button"
                variant="caption"
                onClick={() => handleModuleClick(mod)}
                sx={{
                  color: 'warning.main',
                  fontFamily: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {mod}
              </Link>
              <Box component="span" sx={{ color: 'text.secondary' }}> — stale</Box>
            </Typography>
          ))}
          {status.gaps.map((mod) => (
            <Typography
              key={mod}
              variant="caption"
              sx={{
                display: 'block',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              <Link
                component="button"
                variant="caption"
                onClick={() => handleModuleClick(mod)}
                sx={{
                  color: 'error.main',
                  fontFamily: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {mod}
              </Link>
              <Box component="span" sx={{ color: 'text.secondary' }}> — gaps detected</Box>
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}
