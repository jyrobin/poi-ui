import { useEffect } from 'react'
import { useDrawer } from './useDrawer'

export function useKeyboardShortcuts() {
  const { isOpen, close } = useDrawer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus command input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('[data-command-input]')
        input?.focus()
      }

      // Escape to close drawer or clear input
      if (e.key === 'Escape') {
        // If drawer is open, close it
        if (isOpen) {
          close()
          return
        }
        // Otherwise, blur focus if in input
        if (document.activeElement instanceof HTMLInputElement) {
          document.activeElement.blur()
        }
      }

      // Cmd/Ctrl + / for help (optional)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        // Could open help dialog in the future
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])
}
