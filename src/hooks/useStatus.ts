import { useEffect } from 'react'
import { create } from 'zustand'
import { api, StatusResponse } from '../api/client'

const mockStatus: StatusResponse = {
  documented: 12,
  total: 15,
  stale: ['voiceturn'],
  gaps: ['poi'],
  pending: ['new-svc', 'utils'],
}

interface StatusState {
  status: StatusResponse
  loading: boolean
  error: string | null
  lastUpdated: number | null
  setStatus: (status: StatusResponse) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateFromSSE: (data: { documented: number; total: number; stale: number }) => void
}

export const useStatusStore = create<StatusState>((set) => ({
  status: mockStatus,
  loading: true,
  error: null,
  lastUpdated: null,
  setStatus: (status) => set({ status, lastUpdated: Date.now() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateFromSSE: (data) =>
    set((state) => ({
      status: {
        ...state.status,
        documented: data.documented,
        total: data.total,
        // SSE only sends count, keep existing arrays but update if count changed
      },
      lastUpdated: Date.now(),
    })),
}))

export function useStatus() {
  const { status, loading, error, setStatus, setLoading, setError } = useStatusStore()

  useEffect(() => {
    let mounted = true

    async function fetchStatus() {
      try {
        const data = await api.getStatus()
        if (mounted) {
          setStatus(data)
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

  return { status, loading, error }
}
