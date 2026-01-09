import { useEffect, useRef } from 'react'
import { create } from 'zustand'

// Use relative URL so Vite proxy handles it (works with any host)
const SSE_URL = '/api/events'

// SSE Event types
export interface StatusChangedEvent {
  type: 'status_changed'
  documented: number
  total: number
  stale: number
}

export interface FileChangedEvent {
  type: 'file_changed'
  path: string
  module: string
}

export interface ModuleStaleEvent {
  type: 'module_stale'
  module: string
  reason: string
}

export type SSEEvent = StatusChangedEvent | FileChangedEvent | ModuleStaleEvent

// Connection state store
interface SSEState {
  connected: boolean
  lastEvent: SSEEvent | null
  notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'error'; timestamp: number }>
  setConnected: (connected: boolean) => void
  setLastEvent: (event: SSEEvent) => void
  addNotification: (message: string, type: 'info' | 'warning' | 'error') => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

export const useSSEStore = create<SSEState>((set) => ({
  connected: false,
  lastEvent: null,
  notifications: [],
  setConnected: (connected) => set({ connected }),
  setLastEvent: (event) => set({ lastEvent: event }),
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type, timestamp: Date.now() },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))

interface UseSSEOptions {
  onStatusChanged?: (event: StatusChangedEvent) => void
  onFileChanged?: (event: FileChangedEvent) => void
  onModuleStale?: (event: ModuleStaleEvent) => void
  onError?: (error: Event) => void
  reconnectInterval?: number
}

export function useSSE(options: UseSSEOptions = {}) {
  const { reconnectInterval = 5000 } = options

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(options)
  callbacksRef.current = options

  useEffect(() => {
    const { setConnected, setLastEvent, addNotification } = useSSEStore.getState()

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      try {
        const eventSource = new EventSource(SSE_URL)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setConnected(true)
          // Clear any pending reconnect
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        eventSource.onerror = (error) => {
          setConnected(false)
          callbacksRef.current.onError?.(error)

          // Close the errored connection
          eventSource.close()

          // Schedule reconnect
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              reconnectTimeoutRef.current = null
              connect()
            }, reconnectInterval)
          }
        }

        // Handle connected event from server
        eventSource.addEventListener('connected', () => {
          setConnected(true)
        })

        // Handle specific event types
        eventSource.addEventListener('status_changed', (e) => {
          try {
            const data = JSON.parse(e.data) as StatusChangedEvent
            data.type = 'status_changed'
            setLastEvent(data)
            callbacksRef.current.onStatusChanged?.(data)
          } catch {
            // Ignore parse errors
          }
        })

        eventSource.addEventListener('file_changed', (e) => {
          try {
            const data = JSON.parse(e.data) as FileChangedEvent
            data.type = 'file_changed'
            setLastEvent(data)
            callbacksRef.current.onFileChanged?.(data)
            addNotification(`File changed: ${data.path}`, 'info')
          } catch {
            // Ignore parse errors
          }
        })

        eventSource.addEventListener('module_stale', (e) => {
          try {
            const data = JSON.parse(e.data) as ModuleStaleEvent
            data.type = 'module_stale'
            setLastEvent(data)
            callbacksRef.current.onModuleStale?.(data)
            addNotification(`${data.module} is stale: ${data.reason}`, 'warning')
          } catch {
            // Ignore parse errors
          }
        })
      } catch {
        setConnected(false)
        // Schedule reconnect on connection failure
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null
            connect()
          }, reconnectInterval)
        }
      }
    }

    const disconnect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      setConnected(false)
    }

    connect()
    return disconnect
  }, [reconnectInterval]) // Only reconnectInterval as dependency

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }

  const connect = () => {
    // Trigger reconnect by disconnecting first
    disconnect()
    // The effect will not re-run, so we need to manually connect
    // This is a simplified approach - for manual reconnect, reload the page
  }

  return { connect, disconnect }
}
