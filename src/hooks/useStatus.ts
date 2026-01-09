import { useEffect, useState } from 'react'
import { api, StatusResponse } from '../api/client'

const mockStatus: StatusResponse = {
  documented: 12,
  total: 15,
  stale: ['voiceturn'],
  gaps: ['poi'],
  pending: ['new-svc', 'utils'],
}

export function useStatus() {
  const [status, setStatus] = useState<StatusResponse>(mockStatus)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          // Keep mock data on error
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
  }, [])

  return { status, loading, error }
}
