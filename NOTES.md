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

### Go API Returns null for Empty Slices

Go `nil` slices marshal as JSON `null`, not `[]`. UI code must handle both:

```typescript
// WRONG - crashes on null
status.stale.length

// RIGHT - null-safe
const stale = status.stale ?? []
```

### Polling Store vs Session Data Store

Two separate Zustand stores manage different concerns:

- `usePollingStore` — connection state and notifications (UI-local state)
- `useSessionDataStore` — server data (status, suggestions, workspace) populated by the polling loop

Hooks like `useStatus()` and `useSuggestions()` are thin wrappers that read from `useSessionDataStore`.

### Drawer Content Must Match Mode

The `ContentDrawer` renders different viewers based on `DrawerContent.mode`. Each mode expects specific fields:

| Mode | Required Fields |
|------|----------------|
| `modules` | (none) |
| `module` | `moduleName` |
| `report` | `reportType`, optionally `moduleName` |
| `command-preview` | `commandPreview` |
| `recipes` | (none) |
| `output` | `content` |

Opening a drawer with mismatched mode/fields shows "No content selected".

### Focus Module Affects Commands

When a user types a command without `@module`, the focus module (from `useFocusModule`) is used as default. Clicking a suggestion also sets the focus module. This is intentional — it creates a "working context" flow.

## Debugging

### API Not Responding

1. Check the POI server is running: `curl http://localhost:8765/api/health`
2. Check Vite proxy in `vite.config.ts`
3. Look for CORS errors in browser Network tab
4. Check the connection dot in the header (gray = disconnected)

### Status Not Updating

1. Check polling is running: look for `/api/session` requests in Network tab (every 15s)
2. Verify the server returns fresh data: `curl http://localhost:8765/api/session`
3. Check browser console for fetch errors

### Suggestions Not Appearing

1. Check `/api/session` response has `suggestions` array
2. Verify modules are registered: `poi status`
3. The suggestions store reads from polling data — if polling fails, suggestions stay empty

### Command Preview Empty

1. Check the server has brief files in `.poi/briefs/`
2. Verify the assembler finds briefs for the command type
3. The preview endpoint returns sections — empty sections means no briefs found

## Testing

### Development Server

```bash
# Start both API and UI
# Terminal 1:
cd poi && go run . admin serve --port :8765

# Terminal 2:
cd poi-ui && npm run dev
```

### Build

```bash
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
```

## Historical Decisions

### Polling Over SSE

Replaced SSE (Server-Sent Events) with periodic REST polling because:
- Simpler server implementation (no connection management)
- Works through all proxies and load balancers
- 15-second interval is sufficient for documentation status
- Easier to debug (standard HTTP requests)

### Zustand Over Redux

Chose Zustand for state management because:
- Simpler API, less boilerplate than Redux
- No context providers needed
- Easy store access outside React components
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

The API server owns all heuristics (suggestions ranking, health scoring, coverage calculation). The UI renders what the server sends. This ensures:
- Polling and page refresh give consistent results
- Adding new heuristics requires only server changes
- No client-side state synchronization issues

### Command Preview Pattern

Instead of running commands in the browser, the UI previews what a command would produce. The preview endpoint returns labeled sections with provenance (brief, context, task), letting users inspect the full prompt expansion before copying it to an LLM. This is read-only and safe.

### Drawer Pattern

Used a drawer (slide-in panel) instead of modals because:
- Can show large content without blocking interaction
- Supports copy-to-clipboard workflow
- Works well with command panel layout
- Responsive: overlay on mobile, inline on desktop

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, theme provider, polling setup |
| `src/api/client.ts` | Typed REST API client |
| `src/api/usePolling.ts` | Polling hook + session data store |
| `src/components/AppShell.tsx` | Main layout with responsive drawer |
| `src/components/CommandPanel.tsx` | Left panel with status, suggestions, menu |
| `src/components/ContentDrawer.tsx` | Right drawer routing to viewers |
| `src/components/CommandInput.tsx` | Command entry with autocomplete |
| `src/hooks/useDrawer.ts` | Drawer state management |
| `src/viewers/CommandPreview.tsx` | Sectioned command expansion viewer |
| `src/viewers/ReportViewer.tsx` | Report rendering |
| `src/theme/index.ts` | MUI theme configuration |
| `vite.config.ts` | Vite config with API proxy |
