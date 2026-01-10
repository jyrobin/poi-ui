import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SlotDefinition, ComposerSchema } from '../api/client'

// Fallback empty schema when API is unavailable
const EMPTY_SCHEMA: ComposerSchema = {
  command: '',
  description: '',
  slots: [],
}

export type SlotValue = string | string[] | boolean | null

interface ComposerState {
  // Current composer state
  command: string | null
  module: string | null
  schema: ComposerSchema | null
  values: Record<string, SlotValue>
  overrides: Record<string, string> // Edited content overrides for fragments/slots
  templateName: string | null // The template name (usually same as command)

  // Actions
  startComposer: (command: string, module: string, schema?: ComposerSchema) => void
  setSlotValue: (name: string, value: SlotValue) => void
  setOverride: (slotName: string, content: string) => void
  clearOverride: (slotName: string) => void
  getOverride: (slotName: string) => string | undefined
  hasOverride: (slotName: string) => boolean
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
      overrides: {},
      templateName: null,

      startComposer: (command, module, schema) => {
        const resolvedSchema = schema || EMPTY_SCHEMA || null
        set({
          command,
          module,
          schema: resolvedSchema,
          values: {},
          overrides: {},
          templateName: command, // Template name matches command
        })
      },

      setSlotValue: (name, value) => {
        set((state) => ({
          values: { ...state.values, [name]: value },
        }))
      },

      setOverride: (slotName, content) => {
        set((state) => ({
          overrides: { ...state.overrides, [slotName]: content },
        }))
      },

      clearOverride: (slotName) => {
        set((state) => {
          const { [slotName]: _, ...rest } = state.overrides
          return { overrides: rest }
        })
      },

      getOverride: (slotName) => {
        return get().overrides[slotName]
      },

      hasOverride: (slotName) => {
        return slotName in get().overrides
      },

      clearComposer: () => {
        set({
          command: null,
          module: null,
          schema: null,
          values: {},
          overrides: {},
          templateName: null,
        })
      },

      getSlotDisplayValue: (slot) => {
        const state = get()
        // If there's an override, show "edited" indicator
        if (state.overrides[slot.name]) {
          return 'edited'
        }
        const value = state.values[slot.name]
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
        overrides: state.overrides,
        templateName: state.templateName,
      }),
    }
  )
)

