import { create } from 'zustand'
import { StatusResponse, StatusFlags } from '../api/client'
import { useSessionDataStore } from '../api/usePolling'

const defaultFlags: StatusFlags = {
  needsCollect: false,
  hasStaleModules: false,
  hasGaps: false,
  hasPending: false,
}

const defaultStatus: StatusResponse = {
  documented: 0,
  total: 0,
  stale: [],
  gaps: [],
  pending: [],
  flags: defaultFlags,
}

interface StatusState {
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStatusStore = create<StatusState>((set) => ({
  loading: true,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export function useStatus() {
  const { loading, error } = useStatusStore()

  // Read status from the shared polling store
  const polledStatus = useSessionDataStore((s) => s.status)
  const status = polledStatus ?? defaultStatus

  // Once we have data from polling, loading is done
  const isLoading = loading && !polledStatus

  return { status, loading: isLoading, error }
}
