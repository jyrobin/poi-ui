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
} from '@mui/material'
import StorageIcon from '@mui/icons-material/Storage'
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import { api, DatasetInfo } from '../api/client'
import { useDrawer } from '../hooks/useDrawer'

export default function DatasetListViewer() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { open } = useDrawer()

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true)
        const response = await api.getDatasets()
        setDatasets(response.datasets)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load datasets')
      } finally {
        setLoading(false)
      }
    }
    fetchDatasets()
  }, [])

  const handleDatasetClick = (dataset: DatasetInfo) => {
    open({
      title: dataset.name,
      content: '',
      mode: 'dataset',
      datasetName: dataset.name,
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

  // Group by static vs dynamic
  const staticDatasets = datasets.filter((d) => !d.dynamic)
  const dynamicDatasets = datasets.filter((d) => d.dynamic)

  return (
    <Box>
      {/* Static datasets */}
      {staticDatasets.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Workspace Data ({staticDatasets.length})
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled', mb: 1, ml: 3 }}>
            Available for all modules
          </Typography>
          <List dense sx={{ mx: -2 }}>
            {staticDatasets.map((dataset) => (
              <DatasetListItem
                key={dataset.name}
                dataset={dataset}
                onClick={() => handleDatasetClick(dataset)}
              />
            ))}
          </List>
        </Box>
      )}

      {/* Dynamic datasets */}
      {dynamicDatasets.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <DynamicFeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Module Data ({dynamicDatasets.length})
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled', mb: 1, ml: 3 }}>
            Requires module context to instantiate
          </Typography>
          <List dense sx={{ mx: -2 }}>
            {dynamicDatasets.map((dataset) => (
              <DatasetListItem
                key={dataset.name}
                dataset={dataset}
                onClick={() => handleDatasetClick(dataset)}
              />
            ))}
          </List>
        </Box>
      )}

      {datasets.length === 0 && (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            py: 4,
          }}
        >
          No datasets found
        </Typography>
      )}
    </Box>
  )
}

interface DatasetListItemProps {
  dataset: DatasetInfo
  onClick: () => void
}

function DatasetListItem({ dataset, onClick }: DatasetListItemProps) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        px: 2,
        py: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <StorageIcon
        sx={{
          fontSize: 18,
          mr: 1.5,
          color: dataset.dynamic ? 'info.main' : 'text.secondary',
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
              {dataset.name}
            </Typography>
            {dataset.dynamic && (
              <Chip
                label="dynamic"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  bgcolor: 'info.main',
                  color: 'info.contrastText',
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
            {dataset.description}
          </Typography>
        }
      />
      <Chip
        label={dataset.type}
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
  )
}
