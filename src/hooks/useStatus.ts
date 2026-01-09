import { useEffect } from 'react'
import { create } from 'zustand'
import { api, StatusResponse, StatusFlags } from '../api/client'
import { useSSEStore } from '../api/useSSE'

const defaultFlags: StatusFlags = {
  needsCollect: false,
  hasStaleModules: false,
  hasGaps: false,
  hasPending: false,
}

const mockStatus: StatusResponse = {
  documented: 12,
  total: 15,
  stale: ['voiceturn'],
  gaps: ['poi'],
  pending: ['new-svc', 'utils'],
  flags: defaultFlags,
}

interface StatusState {
  status: StatusResponse
  loading: boolean
  error: string | null
  lastUpdated: number | null
  setStatus: (status: StatusResponse) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStatusStore = create<StatusState>((set) => ({
  status: mockStatus,
  loading: true,
  error: null,
  lastUpdated: null,
  setStatus: (status) => set({ status, lastUpdated: Date.now() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export function useStatus() {
  const { status, loading, error, setStatus, setLoading, setError } = useStatusStore()

  // Subscribe to SSE status events
  const lastStatusEvent = useSSEStore((s) => s.lastStatusEvent)

  // Initial fetch
  useEffect(() => {
    let mounted = true

    async function fetchStatus() {
      try {
        const data = await api.getStatus()
        if (mounted) {
          // Ensure arrays are never null (Go returns null for nil slices)
          setStatus({
            ...data,
            stale: data.stale ?? [],
            gaps: data.gaps ?? [],
            pending: data.pending ?? [],
            flags: data.flags ?? defaultFlags,
          })
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchStatus()

    return () => {
      mounted = false
    }
  }, [setStatus, setLoading, setError])

  // Update status when server pushes new status via SSE
  useEffect(() => {
    if (lastStatusEvent?.status) {
      const data = lastStatusEvent.status
      setStatus({
        ...data,
        stale: data.stale ?? [],
        gaps: data.gaps ?? [],
        pending: data.pending ?? [],
        flags: data.flags ?? defaultFlags,
      })
    }
  }, [lastStatusEvent, setStatus])

  return { status, loading, error }
}
