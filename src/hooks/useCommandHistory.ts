import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CommandHistoryState {
  history: string[]
  maxSize: number
  addCommand: (command: string) => void
  clearHistory: () => void
}

export const useCommandHistory = create<CommandHistoryState>()(
  persist(
    (set) => ({
      history: [],
      maxSize: 50,
      addCommand: (command) =>
        set((state) => {
          // Don't add duplicates of the most recent command
          if (state.history[0] === command) {
            return state
          }
          const newHistory = [command, ...state.history].slice(0, state.maxSize)
          return { history: newHistory }
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'poi-command-history',
    }
  )
)
