import { create } from 'zustand'

export type DrawerMode = 'output' | 'input' | 'detail'

interface DrawerContent {
  title: string
  content: string
  mode: DrawerMode
  slotName?: string // For input mode - which slot to edit
}

interface DrawerState {
  isOpen: boolean
  content: DrawerContent | null
  open: (content: DrawerContent) => void
  close: () => void
  toggle: () => void
}

export const useDrawer = create<DrawerState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
