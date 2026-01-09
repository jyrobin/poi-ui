# POI-UI Notes

## Gotchas

### Vite Proxy Required for API Calls

The client uses relative URLs (`/api/...`) which Vite proxies to the POI server. Without the proxy, API calls fail with CORS errors.

```typescript
// WRONG - hardcoded URL breaks in production
const API_BASE = 'http://localhost:8765/api'

// RIGHT - relative URL works with Vite proxy
const API_BASE = '/api'
```

The proxy is configured in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8765',
  },
}
```

### SSE Events Must Match Server Event Names

The client listens for specific event names. If the server sends a different event name, the client silently ignores it.

```typescript
// WRONG - event name mismatch
eventSource.addEventListener('statusChanged', ...) // Won't receive 'status_changed'

// RIGHT - exact event name match
eventSource.addEventListener('status', ...)
```

Server sends: `event: status\ndata: {...}\n\n`

### Zustand Store Access in Event Handlers

When accessing Zustand store in callbacks (like SSE event handlers), use `getState()` to avoid stale closures.

```typescript
// WRONG - stale closure, won't see updates
const { setStatus } = useStatusStore()
eventSource.addEventListener('status', () => {
  setStatus(newStatus) // May use stale setter
})

// RIGHT - fresh state access
eventSource.addEventListener('status', () => {
  useStatusStore.getState().setStatus(newStatus)
})
```

### Drawer Action Must Update Content via Store

When a drawer action needs to update the displayed content (e.g., showing command results), use `updateContent` from the store.

```typescript
// WRONG - content prop is captured at open time
open({
  content: 'Initial',
  action: {
    onClick: () => {
      // Cannot update content here directly
    }
  }
})

// RIGHT - use store method
const { updateContent } = useDrawer.getState()
open({
  content: 'Initial',
  action: {
    onClick: async () => {
      updateContent('Running...')
      const result = await api.runCommand()
      updateContent(`Result: ${result}`)
    }
  }
})
```

### File Watcher Debouncing

Editors often trigger multiple filesystem events for a single save. The server debounces events within 500ms to prevent duplicate SSE updates.

## Debugging

### SSE Connection Not Working

1. Check browser console for `[sse]` prefixed logs
2. Verify POI server is running: `curl http://localhost:8765/api/health`
3. Check Vite proxy config in `vite.config.ts`
4. Look for CORS errors in Network tab

### Status Not Updating After File Changes

1. Check server logs for `[watcher]` events: `poi serve -v`
2. Verify file is a doc file (DESIGN.md, NOTES.md, .summary.yaml)
3. Check SSE connection status (green dot in header)
4. Look for `[sse] Received status event` in browser console

### Suggestions Not Appearing

1. Check `/api/prompts/suggested` response in Network tab
2. Verify modules are registered: `poi status`
3. Check for API errors in browser console

### Theme Not Persisting

Theme mode is stored in Zustand with no persistence by default. It resets on page refresh. To persist, add `persist` middleware to `useThemeMode`.

## Testing

### Development Server

```bash
# Start both API and UI (recommended)
npm run dev:full

# Or separately:
# Terminal 1:
cd ../poi && poi serve -v

# Terminal 2:
npm run dev
```

### Manual Testing Checklist

1. SSE connection: Edit a doc file, check for status update
2. Suggestions: Click a suggestion, verify drawer shows prompt
3. Collect: Click /collect suggestion, click Run, verify success
4. Module list: Click workspace menu > View Modules
5. Theme toggle: Click sun/moon icon
6. Responsive: Resize window, check drawer behavior

### Build

```bash
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
```

## Historical Decisions

### Zustand Over Redux

Chose Zustand for state management because:
- Simpler API, less boilerplate than Redux
- No context providers needed
- Easy store access outside React components (SSE handlers)
- Small bundle size

### MUI Over Tailwind

Chose Material-UI because:
- Rich component library out of the box
- Built-in dark mode support
- Consistent design system
- TypeScript support

### Vite Over Create React App

Chose Vite because:
- Faster dev server startup
- Native ESM support
- Built-in proxy for API development
- Modern toolchain

### Server-Driven Architecture

The API server owns all heuristics (needsCollect, suggestions ranking). The UI is "dumb" - it renders what the server sends. This ensures:
- SSE and page refresh give consistent results
- Adding new heuristics requires only server changes
- No client-side state synchronization issues

### Drawer Pattern

Used a drawer (slide-in panel) instead of modals because:
- Can show large prompt content without blocking
- Supports copy-to-clipboard workflow
- Works well with command panel layout
- Responsive: overlay on mobile, inline on desktop

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, theme provider, SSE setup |
| `src/components/AppShell.tsx` | Main layout with responsive drawer |
| `src/components/CommandPanel.tsx` | Left panel with status, suggestions, composer |
| `src/components/ContentDrawer.tsx` | Right drawer for viewing prompts/modules |
| `src/api/client.ts` | Typed REST API client |
| `src/api/useSSE.ts` | SSE connection hook and event store |
| `src/hooks/useDrawer.ts` | Drawer state management |
| `src/hooks/useStatus.ts` | Workspace status from API with SSE updates |
| `src/hooks/useSuggestions.ts` | Prompt suggestions with SSE updates |
| `src/theme/index.ts` | MUI theme configuration |
| `vite.config.ts` | Vite config with API proxy |
