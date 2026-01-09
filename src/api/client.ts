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
}

export const api = new ApiClient()
