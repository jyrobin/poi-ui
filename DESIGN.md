# POI-UI Design

## Purpose

POI-UI is a React-based web interface for the POI (Project Organization Intelligence) system. It provides a visual dashboard for exploring workspace documentation status, receiving context-aware prompt suggestions, and executing POI commands through a browser-based interface rather than CLI.

The UI connects to the POI API server via REST and Server-Sent Events (SSE), enabling real-time updates when documentation files change in the workspace.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser                                    │
├─────────────────────────────────────────────────────────────────────┤
│  App                                                                 │
│  ├── ThemeProvider (dark/light mode)                                │
│  ├── SSE Connection (real-time updates)                             │
│  └── AppShell                                                        │
│      ├── CommandPanel (left)                                         │
│      │   ├── Header (workspace name, status dot, theme toggle)      │
│      │   ├── StatusBlock (documented/stale/pending counts)          │
│      │   ├── SuggestionsBlock (ranked prompt suggestions)           │
│      │   ├── ComposerBlock (slot-based prompt builder)              │
│      │   └── CommandInput (manual command entry)                    │
│      ├── DrawerToolbar (toggle drawer, quick actions)               │
│      └── ContentDrawer (right, shows prompts/module details)        │
│          ├── MarkdownViewer (rendered prompts)                      │
│          ├── ModuleDetailViewer (single module info)                │
│          └── ModuleListViewer (all modules list)                    │
└─────────────────────────────────────────────────────────────────────┘
           │                    │
           │ REST API           │ SSE /api/events
           ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     POI API Server (Go)                              │
│  /api/status, /api/modules, /api/prompts, /api/commands/collect     │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
poi-ui/
├── src/
│   ├── api/
│   │   ├── client.ts       # REST API client with typed endpoints
│   │   └── useSSE.ts       # SSE connection hook and Zustand store
│   ├── blocks/
│   │   ├── StatusBlock.tsx      # Documentation status summary
│   │   ├── SuggestionsBlock.tsx # Ranked prompt suggestions
│   │   └── ComposerBlock.tsx    # Slot-based prompt builder
│   ├── components/
│   │   ├── AppShell.tsx    # Main layout (panel + drawer)
│   │   ├── CommandPanel.tsx # Left panel with all blocks
│   │   ├── ContentDrawer.tsx # Right drawer for content
│   │   └── CommandInput.tsx  # Manual command entry
│   ├── composer/
│   │   ├── TextSlotEditor.tsx   # Text input slot
│   │   ├── SelectSlotEditor.tsx # Dropdown slot
│   │   ├── ListSlotEditor.tsx   # Multi-item list slot
│   │   └── ChoiceSlotEditor.tsx # Radio button slot
│   ├── hooks/
│   │   ├── useDrawer.ts    # Drawer state (open/close, content)
│   │   ├── useStatus.ts    # Workspace status from API
│   │   ├── useSuggestions.ts # Prompt suggestions from API
│   │   ├── useComposer.ts  # Composer slot values
│   │   ├── useFocusModule.ts # Currently selected module
│   │   └── useThemeMode.ts # Dark/light theme toggle
│   ├── viewers/
│   │   ├── MarkdownViewer.tsx   # Render markdown content
│   │   ├── ModuleDetailViewer.tsx # Single module details
│   │   └── ModuleListViewer.tsx # All modules list
│   ├── theme/
│   │   └── index.ts        # MUI theme (GitHub-inspired colors)
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── package.json
└── vite.config.ts          # Vite config with API proxy
```

## Key Types/Interfaces

```typescript
// api/client.ts - API response types
interface StatusResponse {
  documented: number
  total: number
  stale: string[]
  gaps: string[]
  pending: string[]
  flags?: StatusFlags
}

interface StatusFlags {
  needsCollect: boolean      // Doc files modified since last collect
  hasStaleModules: boolean   // Modules with outdated docs
  hasGaps: boolean           // Modules with incomplete docs
  hasPending: boolean        // Modules without docs
}

interface Suggestion {
  command: string   // e.g., "update", "fix", "collect"
  module: string    // e.g., "poi" or "" for workspace-level
  score: number     // Higher = more relevant
  reason: string    // Why this is suggested
}

// hooks/useDrawer.ts - Drawer content types
type DrawerMode = 'output' | 'input' | 'detail' | 'module' | 'modules'

interface DrawerContent {
  title: string
  content: string
  mode: DrawerMode
  action?: DrawerAction  // Optional action button
}

interface DrawerAction {
  label: string
  onClick: () => Promise<void> | void
}
```

## Dependencies

**Uses:**
- React 18 with hooks
- MUI (Material-UI) v5 for components
- Zustand for state management (stores for drawer, status, theme, etc.)
- react-markdown for rendering prompt output
- Vite for dev server and build

**Used by:**
- POI API server (provides backend)
- Developers using POI for documentation workflows

## Boundaries

**Belongs here:**
- UI components for displaying POI status
- API client for POI server communication
- SSE handling for real-time updates
- Theme and styling

**Does NOT belong here:**
- Documentation generation logic (belongs in poi CLI)
- File system operations (handled by poi server)
- Prompt templates (defined in poi server)
- LLM integration (user copies prompts to external LLM)
