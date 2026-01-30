import { useSessionDataStore } from '../api/usePolling'

export function useSuggestions(n: number = 5) {
  // Read suggestions from the shared polling store
  const suggestions = useSessionDataStore((s) => s.suggestions)
  const polled = suggestions.length > 0

  return {
    suggestions: suggestions.slice(0, n),
    loading: !polled,
    error: null as string | null,
  }
}
