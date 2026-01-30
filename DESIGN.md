# POI-UI Design

## Purpose

POI-UI is a React-based web interface for the POI (Project Organization Intelligence) system. It provides a workspace dashboard for exploring documentation status, receiving context-aware command suggestions, previewing command expansions, and viewing reports — all through a browser-based interface.

The UI connects to the POI API server (`poi admin serve`) via REST polling, fetching session state periodically.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser                                    │
├─────────────────────────────────────────────────────────────────────┤
│  App                                                                 │
│  ├── ThemeProvider (dark/light mode)                                │
│  ├── usePolling (REST polling every 15s)                            │
│  └── AppShell                                                        │
│      ├── CommandPanel (left)                                         │
│      │   ├── Header (workspace name, connection dot, menu)          │
│      │   ├── StatusBlock (coverage bar, documented/stale/gap chips) │
│      │   ├── SuggestionsBlock (ranked command suggestions)          │
│      │   └── CommandInput (manual command entry with autocomplete)  │
│      └── ContentDrawer (right, context-driven content)              │
│          ├── ModuleListViewer / ModuleDetailViewer                   │
│          ├── ReportViewer (health, coverage, deps, tags, etc.)      │
│          ├── CommandPreview (sectioned command expansion)            │
│          ├── RecipesViewer (multi-step workflows)                   │
│          └── MarkdownViewer (generic markdown)                      │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ REST API (polling + on-demand)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     POI API Server (Go)                              │
│  GET  /api/health, /api/session, /api/status, /api/modules          │
│  GET  /api/suggestions, /api/recipes, /api/reports/{type}           │
│  POST /api/commands/preview, /api/commands/execute                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
poi-ui/
├── src/
│   ├── api/
│   │   ├── client.ts        # REST API client with typed endpoints
│   │   └── usePolling.ts    # Polling hook + Zustand stores
│   ├── blocks/
│   │   ├── StatusBlock.tsx       # Documentation coverage summary
│   │   ├── SuggestionsBlock.tsx  # Ranked command suggestions
│   │   └── NotificationBlock.tsx # Dismissable notifications
│   ├── components/
│   │   ├── AppShell.tsx      # Main layout (panel + drawer)
│   │   ├── CommandPanel.tsx  # Left panel with status + suggestions
│   │   ├── ContentDrawer.tsx # Right drawer for content
│   │   └── CommandInput.tsx  # Command entry with autocomplete
│   ├── hooks/
│   │   ├── useDrawer.ts         # Drawer state (open/close, content mode)
│   │   ├── useStatus.ts         # Status from polling store
│   │   ├── useSuggestions.ts    # Suggestions from polling store
│   │   ├── useWorkspace.ts      # Workspace info from polling store
│   │   ├── useFocusModule.ts    # Currently focused module
│   │   ├── useThemeMode.ts      # Dark/light theme toggle
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcuts
│   │   └── useCommandHistory.ts # Command history
│   ├── viewers/
│   │   ├── MarkdownViewer.tsx       # Render markdown content
│   │   ├── ModuleDetailViewer.tsx   # Single module details
│   │   ├── ModuleListViewer.tsx     # All modules list
│   │   ├── ReportViewer.tsx         # Report rendering
│   │   ├── CommandPreview.tsx       # Sectioned command expansion
│   │   └── RecipesViewer.tsx        # Multi-step workflow recipes
│   ├── theme/
│   │   └── index.ts           # MUI theme (GitHub-inspired colors)
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── package.json
└── vite.config.ts             # Vite config with API proxy
```

## Key Types/Interfaces

```typescript
// api/client.ts - Core types
interface StatusResponse {
  documented: number
  total: number
  stale: string[]
  gaps: string[]
  pending: string[]
  flags?: StatusFlags
}

interface Suggestion {
  command: string   // e.g., "bootstrap", "update-docs", "evaluate"
  module: string    // e.g., "poi" or "" for workspace-level
  score: number
  reason: string
}

interface CommandPreviewResponse {
  command: string
  module: string
  sections: CommandPreviewSection[]  // Labeled sections with provenance
  fullText: string                   // Concatenated text for clipboard
  stats: TokenStats                  // Token/word/line counts
}

interface CommandPreviewSection {
  header: string
  content: string
  source: string      // "brief", "context", "task"
  sourceName: string  // e.g., "docs-requirements"
}

// hooks/useDrawer.ts - Drawer modes
type DrawerMode =
  | 'output'          // Generic markdown
  | 'module'          // Single module detail
  | 'modules'         // Module list
  | 'report'          // Report viewer
  | 'command-preview' // Command expansion preview
  | 'recipes'         // Recipe list

// api/usePolling.ts - Session data store
interface SessionDataState {
  status: StatusResponse | null
  suggestions: Suggestion[]
  workspace: string
}
```

## Dependencies

**Uses:**
- React 18 with hooks
- MUI (Material-UI) v5 for components
- Zustand for state management
- react-markdown for rendering
- Vite for dev server and build

**Used by:**
- POI API server (provides backend at :8765)
- Developers using POI for documentation workflows

## Boundaries

**Belongs here:**
- UI components for displaying POI status and reports
- API client for POI server communication
- Polling-based data refresh
- Command preview and exploration
- Theme and styling

**Does NOT belong here:**
- Documentation generation logic (belongs in poi CLI)
- File system operations (handled by poi server)
- Prompt assembly logic (server assembles, UI displays)
- LLM integration (user copies prompts to external LLM)
