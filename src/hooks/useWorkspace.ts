import { create } from 'zustand'
import { usePollingStore, useSessionDataStore } from '../api/usePolling'

interface WorkspaceState {
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  loading: true,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export function useWorkspace() {
  const { loading, error } = useWorkspaceStore()
  const workspace = useSessionDataStore((s) => s.workspace)
  const connected = usePollingStore((s) => s.connected)

  return {
    workspace,
    connected,
    loading: loading && !workspace,
    error,
  }
}
