import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FocusModuleState {
  module: string | null
  setModule: (module: string | null) => void
}

export const useFocusModule = create<FocusModuleState>()(
  persist(
    (set) => ({
      module: null,
      setModule: (module) => set({ module }),
    }),
    {
      name: 'poi-focus-module',
    }
  )
)
