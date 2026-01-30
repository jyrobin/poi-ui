// Use relative URL so Vite proxy handles it (works with any host)
const API_BASE = '/api'

export interface HealthResponse {
  status: string
  workspace: string
}

export interface StatusFlags {
  needsCollect: boolean
  hasStaleModules: boolean
  hasGaps: boolean
  hasPending: boolean
}

export interface StatusResponse {
  documented: number
  total: number
  stale: string[]
  gaps: string[]
  pending: string[]
  flags?: StatusFlags
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

// Token statistics for LLM usage estimation
export interface TokenStats {
  charCount: number
  wordCount: number
  lineCount: number
  estTokens: number
}

// Command preview types
export interface CommandPreviewRequest {
  command: string
  module: string
}

export interface CommandPreviewSection {
  header: string
  content: string
  source: string     // "brief", "context", "task"
  sourceName: string // e.g. "docs-requirements"
}

export interface CommandPreviewResponse {
  command: string
  module: string
  sections: CommandPreviewSection[]
  fullText: string
  stats: TokenStats
}

// Recipe types
export interface RecipeStep {
  tool: string
  args: string[]
}

export interface Recipe {
  name: string
  description: string
  steps: RecipeStep[]
}

export interface RecipesListResponse {
  recipes: Recipe[]
}

// Session response (polling endpoint)
export interface SessionResponse {
  health: HealthResponse
  status: StatusResponse
  suggestions: Suggestion[]
  workspace: string
}

// Report API types
export interface ReportHealthSummary {
  score: number
  grade: string
  passing: number
  warning: number
  failing: number
}

export interface ReportModuleRow {
  name: string
  type: string
  status: string
  docs: string
}

export interface ReportSuggestionRow {
  command: string
  reason: string
}

export interface ReportSessionResponse {
  health: ReportHealthSummary
  modules: ReportModuleRow[]
  suggestions: ReportSuggestionRow[]
  actionItems: string[]
}

export interface ReportStaleRow {
  name: string
  docsAge: string
  lastCodeChange: string
}

export interface ReportGapRow {
  module: string
  missing: string[]
}

export interface ReportCoverageResponse {
  total: number
  documented: number
  pending: number
  missing: number
  percent: string
  byStatus: Record<string, string[]>
  stale: ReportStaleRow[]
  gaps: ReportGapRow[]
}

export interface ReportDepEdge {
  from: string
  to: string
}

export interface ReportDepsResponse {
  module?: string
  uses?: string[]
  usedBy?: string[]
  external?: string[]
  graph?: ReportDepEdge[]
  cycles?: string[][]
}

export interface ReportTagRow {
  tag: string
  count: number
  modules: string[]
}

export interface ReportTagsResponse {
  tags: ReportTagRow[]
}

export interface ReportGotcha {
  id: string
  summary: string
  tags?: string[]
}

export interface ReportPattern {
  pattern: string
  count: number
  modules: string[]
}

export interface ReportGotchasResponse {
  total: number
  byModule: Record<string, ReportGotcha[]>
  patterns: ReportPattern[]
}

export interface ReportEntity {
  name: string
  file: string
  description: string
}

export interface ReportEntitiesResponse {
  total: number
  byModule: Record<string, ReportEntity[]>
}

export interface ReportHealthCheck {
  name: string
  status: string
  message: string
}

export interface ReportHealthResponse {
  score: number
  grade: string
  checks: ReportHealthCheck[]
  actionItems: string[]
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

  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/health')
  }

  async getStatus(): Promise<StatusResponse> {
    return this.fetch<StatusResponse>('/status')
  }

  async getModules(): Promise<Module[]> {
    return this.fetch<Module[]>('/modules')
  }

  async getSuggestions(n: number = 5): Promise<SuggestionsResponse> {
    return this.fetch<SuggestionsResponse>(`/suggestions?n=${n}`)
  }

  async getSession(): Promise<SessionResponse> {
    return this.fetch<SessionResponse>('/session')
  }

  async previewCommand(request: CommandPreviewRequest): Promise<CommandPreviewResponse> {
    return this.fetch<CommandPreviewResponse>('/commands/preview', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async executeCommand(command: string, module?: string): Promise<{ output: string; error?: string }> {
    return this.fetch('/commands/execute', {
      method: 'POST',
      body: JSON.stringify({ command, module }),
    })
  }

  async getRecipes(): Promise<RecipesListResponse> {
    return this.fetch<RecipesListResponse>('/recipes')
  }

  // Report API methods
  async getReportSession(limit?: number): Promise<ReportSessionResponse> {
    const query = limit ? `?limit=${limit}` : ''
    return this.fetch<ReportSessionResponse>(`/reports/session${query}`)
  }

  async getReportCoverage(module?: string): Promise<ReportCoverageResponse> {
    const query = module ? `?module=${encodeURIComponent(module)}` : ''
    return this.fetch<ReportCoverageResponse>(`/reports/coverage${query}`)
  }

  async getReportDeps(options?: {
    module?: string
    graph?: boolean
    cycles?: boolean
  }): Promise<ReportDepsResponse> {
    const params = new URLSearchParams()
    if (options?.module) params.set('module', options.module)
    if (options?.graph) params.set('graph', 'true')
    if (options?.cycles) params.set('cycles', 'true')
    const query = params.toString() ? `?${params}` : ''
    return this.fetch<ReportDepsResponse>(`/reports/deps${query}`)
  }

  async getReportTags(tags?: string[], any?: boolean): Promise<ReportTagsResponse> {
    const params = new URLSearchParams()
    if (tags && tags.length > 0) params.set('tags', tags.join(','))
    if (any) params.set('any', 'true')
    const query = params.toString() ? `?${params}` : ''
    return this.fetch<ReportTagsResponse>(`/reports/tags${query}`)
  }

  async getReportGotchas(options?: {
    module?: string
    tags?: string[]
    patterns?: boolean
  }): Promise<ReportGotchasResponse> {
    const params = new URLSearchParams()
    if (options?.module) params.set('module', options.module)
    if (options?.tags && options.tags.length > 0) params.set('tags', options.tags.join(','))
    if (options?.patterns) params.set('patterns', 'true')
    const query = params.toString() ? `?${params}` : ''
    return this.fetch<ReportGotchasResponse>(`/reports/gotchas${query}`)
  }

  async getReportEntities(options?: {
    module?: string
    tags?: string[]
  }): Promise<ReportEntitiesResponse> {
    const params = new URLSearchParams()
    if (options?.module) params.set('module', options.module)
    if (options?.tags && options.tags.length > 0) params.set('tags', options.tags.join(','))
    const query = params.toString() ? `?${params}` : ''
    return this.fetch<ReportEntitiesResponse>(`/reports/entities${query}`)
  }

  async getReportHealth(module?: string): Promise<ReportHealthResponse> {
    const query = module ? `?module=${encodeURIComponent(module)}` : ''
    return this.fetch<ReportHealthResponse>(`/reports/health${query}`)
  }
}

export const api = new ApiClient()
