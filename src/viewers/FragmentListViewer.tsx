import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import ExtensionIcon from '@mui/icons-material/Extension'
import { api, FragmentListItem } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'

export default function FragmentListViewer() {
  const [fragments, setFragments] = useState<FragmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { open } = useDrawer()

  useEffect(() => {
    const fetchFragments = async () => {
      try {
        setLoading(true)
        const response = await api.getFragments()
        setFragments(response.fragments)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fragments')
      } finally {
        setLoading(false)
      }
    }
    fetchFragments()
  }, [])

  // Get unique categories for tabs
  const categories = ['all', ...Array.from(new Set(fragments.map((f) => f.category)))]

  // Filter fragments by category
  const filteredFragments =
    categoryFilter === 'all'
      ? fragments
      : fragments.filter((f) => f.category === categoryFilter)

  const handleFragmentClick = (fragment: FragmentListItem) => {
    open({
      title: fragment.name,
      content: '',
      mode: 'fragment',
      fragmentName: fragment.name,
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      {/* Category tabs */}
      <Tabs
        value={categoryFilter}
        onChange={(_, v) => setCategoryFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            px: 1.5,
            fontSize: '0.75rem',
            textTransform: 'none',
          },
        }}
      >
        {categories.map((cat) => (
          <Tab
            key={cat}
            value={cat}
            label={
              cat === 'all'
                ? `All (${fragments.length})`
                : `${cat} (${fragments.filter((f) => f.category === cat).length})`
            }
          />
        ))}
      </Tabs>

      {/* Fragment list */}
      <List dense sx={{ mx: -2 }}>
        {filteredFragments.map((fragment) => (
          <ListItemButton
            key={fragment.name}
            onClick={() => handleFragmentClick(fragment)}
            sx={{
              px: 2,
              py: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ExtensionIcon
              sx={{
                fontSize: 18,
                mr: 1.5,
                color: fragment.source === 'user' ? 'warning.main' : 'text.secondary',
              }}
            />
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {fragment.name}
                  </Typography>
                  {fragment.required && (
                    <Chip
                      label="required"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        bgcolor: 'info.main',
                        color: 'info.contrastText',
                      }}
                    />
                  )}
                  {fragment.source === 'user' && (
                    <Chip
                      label="custom"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25,
                  }}
                >
                  {fragment.description}
                </Typography>
              }
            />
            <Chip
              label={fragment.category}
              size="small"
              variant="outlined"
              sx={{
                ml: 1,
                height: 20,
                fontSize: '0.625rem',
                borderColor: 'divider',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {filteredFragments.length === 0 && (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            py: 4,
          }}
        >
          No fragments found
        </Typography>
      )}
    </Box>
  )
}
