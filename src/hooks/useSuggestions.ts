import { useEffect, useState } from 'react'
import { api, Suggestion } from '../api/client'
import { useSSEStore } from '../api/useSSE'

const mockSuggestions: Suggestion[] = [
  { command: 'fix', module: 'poi', score: 105, reason: 'Gaps detected in documentation' },
  { command: 'update', module: 'voiceturn', score: 100, reason: 'Documentation is stale' },
  { command: 'bootstrap', module: 'new-svc', score: 80, reason: 'No documentation exists' },
  { command: 'evaluate', module: 'cliq', score: 60, reason: 'Not evaluated recently' },
]

export function useSuggestions(n: number = 5) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to SSE status events for server-pushed suggestions
  const lastStatusEvent = useSSEStore((s) => s.lastStatusEvent)

  // Initial fetch
  useEffect(() => {
    let mounted = true

    async function fetchSuggestions() {
      try {
        const data = await api.getSuggestions(n)
        if (mounted) {
          setSuggestions(data.suggestions?.slice(0, n) ?? [])
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          // Keep mock data on error
          setError(err instanceof Error ? err.message : 'Failed to fetch suggestions')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSuggestions()

    return () => {
      mounted = false
    }
  }, [n])

  // Update suggestions when server pushes new status via SSE
  useEffect(() => {
    if (lastStatusEvent?.suggestions) {
      setSuggestions(lastStatusEvent.suggestions.slice(0, n))
    }
  }, [lastStatusEvent, n])

  return { suggestions, loading, error }
}
