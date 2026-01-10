import { create } from 'zustand'

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
  action?: DrawerAction // Optional action button
}

interface DrawerState {
  isOpen: boolean
  content: DrawerContent | null
  open: (content: DrawerContent) => void
  close: () => void
  toggle: () => void
  updateContent: (content: string) => void
}

export const useDrawer = create<DrawerState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  updateContent: (content) => set((state) => ({
    content: state.content ? { ...state.content, content } : null,
  })),
}))
