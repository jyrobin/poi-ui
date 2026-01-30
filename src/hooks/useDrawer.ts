import { create } from 'zustand'
import type { CommandPreviewResponse } from '../api/client'

export type DrawerMode =
  | 'output'
  | 'module'
  | 'modules'
  | 'report'
  | 'command-preview'
  | 'recipes'

export interface DrawerAction {
  label: string
  onClick: () => Promise<void> | void
}

interface DrawerContent {
  title: string
  content: string
  mode: DrawerMode
  moduleName?: string
  reportType?: string
  action?: DrawerAction
  commandPreview?: CommandPreviewResponse
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
