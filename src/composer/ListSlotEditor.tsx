import { useState } from 'react'
import { Box, Typography, Button, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { SlotDefinition } from '../api/client'
import { useComposer } from '../hooks/useComposer'

interface ListSlotEditorProps {
  slot: SlotDefinition
  onDone: () => void
}

export default function ListSlotEditor({ slot, onDone }: ListSlotEditorProps) {
  const { values, setSlotValue } = useComposer()
  const items = (values[slot.name] as string[]) || []
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      setSlotValue(slot.name, [...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemove = (index: number) => {
    setSlotValue(slot.name, items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
          {slot.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {slot.required && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Required
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {items.length} items
          </Typography>
        </Box>
      </Box>

      {/* Add input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={slot.placeholder || 'Add item...'}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8125rem',
            },
          }}
        />
        <IconButton onClick={handleAdd} disabled={!newItem.trim()} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      {/* Items list */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default', borderRadius: 1 }}>
        {items.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}
          >
            No items added yet
          </Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {items.map((item, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemove(index)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {item}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setSlotValue(slot.name, [])}
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          Clear All
        </Button>
        <Button size="small" variant="contained" onClick={onDone}>
          Done
        </Button>
      </Box>
    </Box>
  )
}
