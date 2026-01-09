import { useEffect } from 'react'
import { create } from 'zustand'
import { api } from '../api/client'

interface WorkspaceState {
  workspace: string | null
  connected: boolean
  loading: boolean
  error: string | null
  setWorkspace: (workspace: string) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  connected: false,
  loading: true,
  error: null,
  setWorkspace: (workspace) => set({ workspace, connected: true }),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export function useWorkspace() {
  const { workspace, connected, loading, error, setWorkspace, setLoading, setError } = useWorkspaceStore()

  useEffect(() => {
    let mounted = true

    async function fetchHealth() {
      try {
        const data = await api.getHealth()
        if (mounted) {
          setWorkspace(data.workspace)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect to server')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchHealth()

    return () => {
      mounted = false
    }
  }, [setWorkspace, setLoading, setError])

  return { workspace, connected, loading, error }
}
