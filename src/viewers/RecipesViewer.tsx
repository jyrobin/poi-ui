import { useState, useEffect } from 'react'
import { Box, Typography, List, ListItemButton, ListItemText, Chip, Skeleton } from '@mui/material'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import { api, Recipe } from '../api/client'

interface RecipesViewerProps {
  onSelect?: (recipe: Recipe) => void
}

export default function RecipesViewer({ onSelect }: RecipesViewerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getRecipes()
      .then((res) => setRecipes(res.recipes ?? []))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error.main" variant="body2">
        {error}
      </Typography>
    )
  }

  if (recipes.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <PlaylistPlayIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No recipes configured
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Add recipes to <code>.poi.yaml</code> to define multi-step workflows.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <List dense sx={{ py: 0 }}>
        {recipes.map((recipe) => (
          <ListItemButton
            key={recipe.name}
            onClick={() => onSelect?.(recipe)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'rgba(124, 156, 255, 0.08)',
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {recipe.name}
                  </Typography>
                  <Chip
                    label={`${recipe.steps.length} steps`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.625rem',
                      bgcolor: 'rgba(139, 148, 158, 0.15)',
                      color: 'text.secondary',
                    }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}
                  >
                    {recipe.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {recipe.steps.map((step, i) => (
                      <Chip
                        key={i}
                        label={`${step.tool} ${step.args.join(' ')}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.5625rem',
                          borderColor: 'divider',
                          color: 'text.secondary',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
