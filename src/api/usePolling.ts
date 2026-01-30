import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { api, StatusResponse, Suggestion } from './client'

// Notification with optional action
export interface Notification {
  id: string
  message: string
  type: 'info' | 'warning' | 'error'
  timestamp: number
  action?: {
    label: string
    handler: () => void
  }
}

// Connection state store (replaces SSE store)
interface PollingState {
  connected: boolean
  notifications: Notification[]
  setConnected: (connected: boolean) => void
  addNotification: (message: string, type: 'info' | 'warning' | 'error', action?: Notification['action']) => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

export const usePollingStore = create<PollingState>((set) => ({
  connected: false,
  notifications: [],
  setConnected: (connected) => set({ connected }),
  addNotification: (message, type, action) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type, timestamp: Date.now(), action },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))

// Stores that polling writes to (imported by useStatus, useSuggestions, useWorkspace)
interface SessionDataState {
  status: StatusResponse | null
  suggestions: Suggestion[]
  workspace: string | null
  setStatus: (status: StatusResponse) => void
  setSuggestions: (suggestions: Suggestion[]) => void
  setWorkspace: (workspace: string) => void
}

export const useSessionDataStore = create<SessionDataState>((set) => ({
  status: null,
  suggestions: [],
  workspace: null,
  setStatus: (status) => set({ status }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setWorkspace: (workspace) => set({ workspace }),
}))

/**
 * usePolling polls /api/session at the given interval and pushes data
 * into the status, suggestions, and workspace stores.
 */
export function usePolling(intervalMs: number = 15000) {
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const { setConnected } = usePollingStore.getState()
    const { setStatus, setSuggestions, setWorkspace } = useSessionDataStore.getState()

    const poll = async () => {
      try {
        const session = await api.getSession()
        setConnected(true)

        if (session.status) {
          setStatus({
            ...session.status,
            stale: session.status.stale ?? [],
            gaps: session.status.gaps ?? [],
            pending: session.status.pending ?? [],
          })
        }

        if (session.suggestions) {
          setSuggestions(session.suggestions)
        }

        if (session.workspace) {
          setWorkspace(session.workspace)
        }
      } catch {
        setConnected(false)
      }
    }

    // Poll immediately on mount
    poll()

    // Then poll at interval
    intervalRef.current = window.setInterval(poll, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [intervalMs])
}
