import { useState } from 'react'
import { Box, Typography, IconButton, Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useDrawer } from '../hooks/useDrawer'
import { useComposer } from '../hooks/useComposer'
import { DRAWER_MIN_WIDTH, DRAWER_MAX_WIDTH } from '../theme'
import MarkdownViewer from '../viewers/MarkdownViewer'
import PromptEditor from '../viewers/PromptEditor'
import ModuleDetailViewer from '../viewers/ModuleDetailViewer'
import ModuleListViewer from '../viewers/ModuleListViewer'
import TemplateListViewer from '../viewers/TemplateListViewer'
import TemplateDetailViewer from '../viewers/TemplateDetailViewer'
import FragmentListViewer from '../viewers/FragmentListViewer'
import FragmentDetailViewer from '../viewers/FragmentDetailViewer'
import DatasetListViewer from '../viewers/DatasetListViewer'
import DatasetDetailViewer from '../viewers/DatasetDetailViewer'
import TextSlotEditor from '../composer/TextSlotEditor'
import SelectSlotEditor from '../composer/SelectSlotEditor'
import ListSlotEditor from '../composer/ListSlotEditor'
import ChoiceSlotEditor from '../composer/ChoiceSlotEditor'
import FragmentSlotEditor from '../composer/FragmentSlotEditor'

export default function ContentDrawer() {
  const { content, close } = useDrawer()
  const { schema } = useComposer()
  const [actionLoading, setActionLoading] = useState(false)

  const handleAction = async () => {
    if (content?.action) {
      setActionLoading(true)
      try {
        await content.action.onClick()
      } finally {
        setActionLoading(false)
      }
    }
  }

  // Find slot definition for input or fragment-edit mode
  const slot = (content?.mode === 'input' || content?.mode === 'fragment-edit') && content?.slotName && schema
    ? schema.slots.find((s) => s.name === content.slotName)
    : null

  const renderSlotEditor = () => {
    if (!slot) return null

    const handleDone = () => close()

    switch (slot.type) {
      case 'text':
        return <TextSlotEditor slot={slot} onDone={handleDone} />
      case 'select':
        return <SelectSlotEditor slot={slot} onDone={handleDone} />
      case 'list':
        return <ListSlotEditor slot={slot} onDone={handleDone} />
      case 'choice':
        return <ChoiceSlotEditor slot={slot} onDone={handleDone} />
      case 'fragment':
        return <FragmentSlotEditor slot={slot} onDone={handleDone} />
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: { md: DRAWER_MIN_WIDTH },
        maxWidth: { md: DRAWER_MAX_WIDTH },
        height: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      {/* Drawer header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {content?.title || 'Content'}
        </Typography>
        <IconButton size="small" onClick={close} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Drawer content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {(content?.mode === 'input' || content?.mode === 'fragment-edit') && slot ? (
          renderSlotEditor()
        ) : content?.mode === 'modules' ? (
          <ModuleListViewer />
        ) : content?.mode === 'module' && content.moduleName ? (
          <ModuleDetailViewer moduleName={content.moduleName} />
        ) : content?.mode === 'templates' ? (
          <TemplateListViewer />
        ) : content?.mode === 'template' && content.templateName ? (
          <TemplateDetailViewer templateName={content.templateName} />
        ) : content?.mode === 'fragments' ? (
          <FragmentListViewer />
        ) : content?.mode === 'fragment' && content.fragmentName ? (
          <FragmentDetailViewer fragmentName={content.fragmentName} />
        ) : content?.mode === 'datasets' ? (
          <DatasetListViewer />
        ) : content?.mode === 'dataset' && content.datasetName ? (
          <DatasetDetailViewer datasetName={content.datasetName} />
        ) : content?.mode === 'prompt-edit' && content?.content ? (
          <PromptEditor
            content={content.content}
            originalContent={content.originalContent}
            templateSource={content.templateSource}
            templateName={content.templateName}
          />
        ) : content?.mode === 'output' && content?.content ? (
          <PromptEditor
            content={content.content}
            originalContent={content.content}
          />
        ) : content?.content ? (
          <MarkdownViewer content={content.content} />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No content selected
          </Typography>
        )}
      </Box>

      {/* Drawer actions - show for output/prompt-edit mode when there's an action */}
      {(content?.mode === 'output' || content?.mode === 'prompt-edit') && content?.action && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleAction}
            disabled={actionLoading}
            sx={{
              '&:hover': { bgcolor: 'success.dark' },
            }}
          >
            {content.action.label}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={close}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'transparent' },
            }}
          >
            Close
          </Button>
        </Box>
      )}
    </Box>
  )
}
