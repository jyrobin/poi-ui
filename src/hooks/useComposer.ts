import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SlotDefinition, ComposerSchema } from '../api/client'

// Mock schemas for when API is unavailable
const MOCK_SCHEMAS: Record<string, ComposerSchema> = {
  investigate: {
    command: 'investigate',
    description: 'Bug investigation with context',
    slots: [
      { name: 'problem', type: 'text', label: 'Problem', required: true, placeholder: 'Describe the issue...' },
      { name: 'modules', type: 'select', label: 'Modules', required: true, options: ['poi', 'voiceturn', 'cliq', 'new-svc'] },
      { name: 'logs', type: 'text', label: 'Logs', required: false, placeholder: 'Paste log output here...' },
      { name: 'files', type: 'select', label: 'Files', required: false, options: [] }, // Options loaded dynamically
    ],
  },
  update: {
    command: 'update',
    description: 'Update documentation',
    slots: [
      { name: 'sections', type: 'select', label: 'Sections', required: false, options: ['purpose', 'architecture', 'key-types', 'boundaries', 'all'] },
      { name: 'focus', type: 'choice', label: 'Focus', required: false, options: ['architecture', 'api', 'operations', 'all'] },
      { name: 'changes', type: 'text', label: 'Changes', required: false, placeholder: 'Describe recent changes...' },
    ],
  },
  context: {
    command: 'context',
    description: 'Gather navigation context',
    slots: [
      { name: 'modules', type: 'select', label: 'Modules', required: true, options: ['poi', 'voiceturn', 'cliq', 'new-svc'] },
      { name: 'depth', type: 'choice', label: 'Depth', required: false, options: ['direct', 'transitive', 'full'] },
      { name: 'include', type: 'select', label: 'Include', required: false, options: ['design', 'notes', 'summary', 'code'] },
    ],
  },
  incident: {
    command: 'incident',
    description: 'Record incident',
    slots: [
      { name: 'summary', type: 'text', label: 'Summary', required: true, placeholder: 'Brief incident summary...' },
      { name: 'root_cause', type: 'text', label: 'Root Cause', required: false, placeholder: 'What caused the issue...' },
      { name: 'fix', type: 'text', label: 'Fix', required: false, placeholder: 'How it was fixed...' },
      { name: 'files', type: 'select', label: 'Files', required: false, options: [] }, // Options loaded dynamically
    ],
  },
}

export type SlotValue = string | string[] | null

interface ComposerState {
  // Current composer state
  command: string | null
  module: string | null
  schema: ComposerSchema | null
  values: Record<string, SlotValue>

  // Actions
  startComposer: (command: string, module: string, schema?: ComposerSchema) => void
  setSlotValue: (name: string, value: SlotValue) => void
  clearComposer: () => void
  getSlotDisplayValue: (slot: SlotDefinition) => string
}

export const useComposer = create<ComposerState>()(
  persist(
    (set, get) => ({
      command: null,
      module: null,
      schema: null,
      values: {},

      startComposer: (command, module, schema) => {
        const resolvedSchema = schema || MOCK_SCHEMAS[command] || null
        set({
          command,
          module,
          schema: resolvedSchema,
          values: {},
        })
      },

      setSlotValue: (name, value) => {
        set((state) => ({
          values: { ...state.values, [name]: value },
        }))
      },

      clearComposer: () => {
        set({
          command: null,
          module: null,
          schema: null,
          values: {},
        })
      },

      getSlotDisplayValue: (slot) => {
        const value = get().values[slot.name]
        if (value === null || value === undefined) return 'empty'
        if (Array.isArray(value)) {
          return value.length === 0 ? 'empty' : String(value.length)
        }
        if (typeof value === 'string') {
          if (value.length === 0) return 'empty'
          if (value.length > 20) return value.slice(0, 20) + '...'
          return value
        }
        return 'empty'
      },
    }),
    {
      name: 'poi-composer',
      partialize: (state) => ({
        command: state.command,
        module: state.module,
        schema: state.schema,
        values: state.values,
      }),
    }
  )
)

export { MOCK_SCHEMAS }
