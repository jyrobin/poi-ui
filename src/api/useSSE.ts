import { useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'

const SSE_URL = 'http://localhost:8765/api/events'

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
  const {
    onStatusChanged,
    onFileChanged,
    onModuleStale,
    onError,
    reconnectInterval = 5000,
  } = options

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const { setConnected, setLastEvent, addNotification } = useSSEStore()

  const connect = useCallback(() => {
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
        onError?.(error)

        // Schedule reconnect
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null
            connect()
          }, reconnectInterval)
        }
      }

      // Handle specific event types
      eventSource.addEventListener('status_changed', (e) => {
        try {
          const data = JSON.parse(e.data) as StatusChangedEvent
          data.type = 'status_changed'
          setLastEvent(data)
          onStatusChanged?.(data)
        } catch {
          // Ignore parse errors
        }
      })

      eventSource.addEventListener('file_changed', (e) => {
        try {
          const data = JSON.parse(e.data) as FileChangedEvent
          data.type = 'file_changed'
          setLastEvent(data)
          onFileChanged?.(data)
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
          onModuleStale?.(data)
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
  }, [onStatusChanged, onFileChanged, onModuleStale, onError, reconnectInterval, setConnected, setLastEvent, addNotification])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setConnected(false)
  }, [setConnected])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { connect, disconnect }
}
