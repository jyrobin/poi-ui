import { Box, InputBase } from '@mui/material'
import { useState } from 'react'

export default function CommandInput() {
  const [value, setValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      // Phase 1: Just log to console
      console.log('Command:', value)
      setValue('')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        px: 1.5,
        py: 0.75,
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 1px rgba(124, 156, 255, 0.2)',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          color: 'text.secondary',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.8125rem',
          mr: 0.5,
          userSelect: 'none',
        }}
      >
        /
      </Box>
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="command @module"
        fullWidth
        sx={{
          '& .MuiInputBase-input': {
            p: 0,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.8125rem',
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 0.6,
            },
          },
        }}
      />
    </Box>
  )
}
