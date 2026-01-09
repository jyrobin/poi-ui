import { Box, Typography, Chip, LinearProgress } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

// Mock data for Phase 1
const mockStatus = {
  documented: 12,
  total: 15,
  stale: ['voiceturn'],
  gaps: ['poi'],
  pending: ['new-svc', 'utils'],
}

export default function StatusBlock() {
  const coverage = Math.round((mockStatus.documented / mockStatus.total) * 100)
  const hasIssues = mockStatus.stale.length > 0 || mockStatus.gaps.length > 0

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
            {mockStatus.documented}/{mockStatus.total}
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
          label={`${mockStatus.documented} documented`}
          size="small"
          sx={{
            bgcolor: 'rgba(63, 185, 80, 0.15)',
            color: 'success.main',
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />
        {mockStatus.stale.length > 0 && (
          <Chip
            icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
            label={`${mockStatus.stale.length} stale`}
            size="small"
            sx={{
              bgcolor: 'rgba(210, 153, 34, 0.15)',
              color: 'warning.main',
              '& .MuiChip-icon': { color: 'warning.main' },
            }}
          />
        )}
        {mockStatus.gaps.length > 0 && (
          <Chip
            icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
            label={`${mockStatus.gaps.length} gaps`}
            size="small"
            sx={{
              bgcolor: 'rgba(248, 81, 73, 0.15)',
              color: 'error.main',
              '& .MuiChip-icon': { color: 'error.main' },
            }}
          />
        )}
        {mockStatus.pending.length > 0 && (
          <Chip
            label={`${mockStatus.pending.length} pending`}
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
          {mockStatus.stale.map((mod) => (
            <Typography
              key={mod}
              variant="caption"
              sx={{
                display: 'block',
                color: 'warning.main',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {mod} — stale
            </Typography>
          ))}
          {mockStatus.gaps.map((mod) => (
            <Typography
              key={mod}
              variant="caption"
              sx={{
                display: 'block',
                color: 'error.main',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {mod} — gaps detected
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}
