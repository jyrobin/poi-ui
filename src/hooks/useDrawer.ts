import { create } from 'zustand'
import type { TokenStats } from '../api/client'

export type DrawerMode =
  | 'output'
  | 'input'
  | 'detail'
  | 'module'
  | 'modules'
  | 'templates'    // Template list view
  | 'template'     // Single template detail
  | 'fragments'    // Fragment list view
  | 'fragment'     // Single fragment detail
  | 'datasets'     // Dataset list view
  | 'dataset'      // Single dataset detail
  | 'prompt-edit'  // Prompt editing with preview/edit tabs
  | 'fragment-edit' // Fragment slot editing with preview/edit/template tabs
  | 'report'       // Report view

export type EditorTab = 'preview' | 'edit' | 'template'

export interface DrawerAction {
  label: string
  onClick: () => Promise<void> | void
}

interface DrawerContent {
  title: string
  content: string
  mode: DrawerMode
  slotName?: string // For input mode - which slot to edit
  moduleName?: string // For module mode - which module to show
  templateName?: string // For template mode - which template to show
  fragmentName?: string // For fragment mode - which fragment to show
  datasetName?: string // For dataset mode - which dataset to show
  reportType?: string // For report mode - which report to show
  action?: DrawerAction // Optional action button
  // For prompt-edit mode
  originalContent?: string // Original content before edits
  templateSource?: string // Raw template source for reference
  stats?: TokenStats // Token statistics for prompts
}

interface DrawerState {
  isOpen: boolean
  content: DrawerContent | null
  editorTab: EditorTab
  editedContent: string | null // Track edits separately
  open: (content: DrawerContent) => void
  close: () => void
  toggle: () => void
  updateContent: (content: string) => void
  setEditorTab: (tab: EditorTab) => void
  setEditedContent: (content: string) => void
  resetEdits: () => void
  hasEdits: () => boolean
}

export const useDrawer = create<DrawerState>((set, get) => ({
  isOpen: false,
  content: null,
  editorTab: 'preview',
  editedContent: null,
  open: (content) => set({
    isOpen: true,
    content,
    editorTab: 'preview',
    editedContent: null,
  }),
  close: () => set({ isOpen: false, editedContent: null, editorTab: 'preview' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  updateContent: (content) => set((state) => ({
    content: state.content ? { ...state.content, content } : null,
  })),
  setEditorTab: (tab) => set({ editorTab: tab }),
  setEditedContent: (content) => set({ editedContent: content }),
  resetEdits: () => set((state) => ({
    editedContent: null,
    content: state.content?.originalContent
      ? { ...state.content, content: state.content.originalContent }
      : state.content,
  })),
  hasEdits: () => {
    const state = get()
    return state.editedContent !== null &&
           state.editedContent !== state.content?.originalContent
  },
}))
