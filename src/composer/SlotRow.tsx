import { Box, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'

interface SlotRowProps {
  slot: SlotDefinition
  onClick: () => void
}

export default function SlotRow({ slot, onClick }: SlotRowProps) {
  const { getSlotDisplayValue } = useComposer()
  const displayValue = getSlotDisplayValue(slot)
  const isEmpty = displayValue === 'empty'

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        cursor: 'pointer',
        borderBottom: 1,
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'rgba(124, 156, 255, 0.08)',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          width: 100,
          flexShrink: 0,
        }}
      >
        {slot.label}
        {slot.required && (
          <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>

      <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', mx: 0.5 }} />

      <Typography
        variant="body2"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.75rem',
          color: isEmpty ? 'text.secondary' : 'text.primary',
          fontStyle: isEmpty ? 'italic' : 'normal',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  )
}
