import { Box, Typography, Switch, Chip, Tooltip } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExtensionIcon from '@mui/icons-material/Extension'
import ListIcon from '@mui/icons-material/List'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'

// Color scheme for different slot types
const slotTypeColors = {
  fragment: { bg: 'rgba(156, 39, 176, 0.08)', color: '#9c27b0' }, // purple
  select: { bg: 'rgba(33, 150, 243, 0.08)', color: '#2196f3' },   // blue
  text: { bg: 'rgba(76, 175, 80, 0.08)', color: '#4caf50' },       // green
}

interface SlotRowProps {
  slot: SlotDefinition
  onClick: () => void
}

export default function SlotRow({ slot, onClick }: SlotRowProps) {
  const { getSlotDisplayValue, values, setSlotValue } = useComposer()
  const displayValue = getSlotDisplayValue(slot)
  const isEmpty = displayValue === 'empty'

  // Fragment slots use a toggle
  if (slot.type === 'fragment') {
    const isEnabled = values[slot.name] !== false // Default to enabled
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSlotValue(slot.name, !isEnabled)
    }
    const colors = slotTypeColors.fragment

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
          bgcolor: colors.bg,
          '&:hover': {
            bgcolor: 'rgba(156, 39, 176, 0.12)',
          },
        }}
      >
        <ExtensionIcon sx={{ fontSize: 16, color: colors.color, mr: 1 }} />
        <Box
          component="span"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
            color: colors.color,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {slot.label}
          {slot.required && (
            <Chip
              label="required"
              size="small"
              sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
            />
          )}
        </Box>
        <Tooltip title={isEnabled ? 'Click to exclude' : 'Click to include'}>
          <Switch
            size="small"
            checked={isEnabled}
            onClick={handleToggle}
            disabled={slot.required}
          />
        </Tooltip>
      </Box>
    )
  }

  // Select slots (dataset-backed)
  if (slot.type === 'select') {
    const colors = slotTypeColors.select

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
          bgcolor: colors.bg,
          '&:hover': {
            bgcolor: 'rgba(33, 150, 243, 0.12)',
          },
        }}
      >
        <ListIcon sx={{ fontSize: 16, color: colors.color, mr: 1 }} />
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
            color: colors.color,
            width: 120,
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

        <ChevronRightIcon sx={{ fontSize: 16, color: colors.color, mx: 0.5 }} />

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

  // Text slots (free text input)
  const colors = slotTypeColors.text

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
        bgcolor: colors.bg,
        '&:hover': {
          bgcolor: 'rgba(76, 175, 80, 0.12)',
        },
      }}
    >
      <EditNoteIcon sx={{ fontSize: 16, color: colors.color, mr: 1 }} />
      <Typography
        variant="body2"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.75rem',
          color: colors.color,
          width: 120,
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

      <ChevronRightIcon sx={{ fontSize: 16, color: colors.color, mx: 0.5 }} />

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
