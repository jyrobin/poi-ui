const API_BASE = 'http://localhost:8765/api'

export interface StatusResponse {
  documented: number
  total: number
  stale: string[]
  gaps: string[]
  pending: string[]
}

export interface Module {
  name: string
  path: string
  status: 'documented' | 'stale' | 'pending' | 'gap'
  type: string
}

export interface Suggestion {
  command: string
  module: string
  score: number
  reason: string
}

export interface SuggestionsResponse {
  suggestions: Suggestion[]
}

export interface PromptRequest {
  command: string
  module: string
  options?: Record<string, unknown>
}

export interface PromptResponse {
  prompt: string
  title: string
}

// Composer types
export type SlotType = 'text' | 'select' | 'list' | 'choice'

export interface SlotDefinition {
  name: string
  type: SlotType
  label: string
  required: boolean
  options?: string[] // for select/choice types
  placeholder?: string
}

export interface ComposerSchema {
  command: string
  description: string
  slots: SlotDefinition[]
}

export interface ComposerBuildRequest {
  command: string
  module: string
  slots: Record<string, unknown>
}

export interface FileInfo {
  path: string
  name: string
  type: 'file' | 'directory'
}

class ApiClient {
  private base: string

  constructor(base: string = API_BASE) {
    this.base = base
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }

    return res.json()
  }

  async getStatus(): Promise<StatusResponse> {
    return this.fetch<StatusResponse>('/status')
  }

  async getModules(): Promise<Module[]> {
    return this.fetch<Module[]>('/modules')
  }

  async getSuggestions(n: number = 5): Promise<SuggestionsResponse> {
    return this.fetch<SuggestionsResponse>(`/prompts/suggested?n=${n}`)
  }

  async generatePrompt(request: PromptRequest): Promise<PromptResponse> {
    return this.fetch<PromptResponse>('/prompt', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getComposerSchema(command: string): Promise<ComposerSchema> {
    return this.fetch<ComposerSchema>(`/composer/schema/${command}`)
  }

  async buildPrompt(request: ComposerBuildRequest): Promise<PromptResponse> {
    return this.fetch<PromptResponse>('/composer/build', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async listFiles(module: string): Promise<{ files: FileInfo[] }> {
    return this.fetch<{ files: FileInfo[] }>(`/files/list?module=${encodeURIComponent(module)}`)
  }

  async readFiles(paths: string[]): Promise<{ files: { path: string; content: string }[] }> {
    return this.fetch<{ files: { path: string; content: string }[] }>('/files/read', {
      method: 'POST',
      body: JSON.stringify({ paths }),
    })
  }
}

export const api = new ApiClient()
