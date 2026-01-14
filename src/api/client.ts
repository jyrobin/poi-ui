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

export interface ModuleInfo {
  name: string
  path: string
  status?: 'ok' | 'stale' | 'missing'
  documented: boolean
  files?: string[]
  designPath?: string
  notesPath?: string
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

// Token statistics for LLM usage estimation
export interface TokenStats {
  charCount: number
  wordCount: number
  lineCount: number
  estTokens: number
}

export interface PromptResponse {
  prompt: string
  title: string
  stats?: TokenStats
}

// Composer types
export type SlotType = 'text' | 'select' | 'list' | 'choice' | 'fragment'

export interface SlotDefinition {
  name: string
  type: SlotType
  label: string
  required: boolean
  options?: string[] // for select/choice types
  placeholder?: string
  dataset?: string // for select slots - which dataset provides options
  fragment?: string // for fragment slots - which fragment this toggles
  description?: string // slot description
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
  overrides?: Record<string, string> // Edited content overrides for fragments/slots
}

export interface FileInfo {
  path: string
  name: string
  type: 'file' | 'directory'
}

export interface CollectResult {
  success: boolean
  modules: number
  tags: number
  messages: string[]
  error?: string
}

// Template Editor API types
export interface TemplateListItem {
  name: string
  intent: string
  description: string
  source: 'builtin' | 'user'
  params?: string[]
}

export interface TemplatesListResponse {
  templates: TemplateListItem[]
}

export interface TemplateDetail {
  name: string
  intent: string
  description: string
  source: 'builtin' | 'user'
  params?: string[]
  raw: string
  fragments?: string[]
  datasets?: string[]
  isCustom: boolean
}

export interface TemplatePreviewRequest {
  module?: string
  data?: Record<string, unknown>
}

export interface TemplatePreviewResponse {
  name: string
  rendered?: string
  error?: string
  stats?: TokenStats
}

export interface TemplateSaveRequest {
  content: string
}

export interface TemplateSaveResponse {
  name: string
  path: string
  isNew: boolean
  message: string
}

export interface TemplateResetResponse {
  name: string
  message: string
}

export interface TemplateValidateRequest {
  content: string
}

export interface TemplateValidateResponse {
  valid: boolean
  error?: string
}

export interface TemplateBuiltinResponse {
  name: string
  content: string
  exists: boolean
}

export interface FragmentListItem {
  name: string
  category: string
  description: string
  required: boolean
  source: 'builtin' | 'user'
}

export interface FragmentsListResponse {
  fragments: FragmentListItem[]
  byCategory?: Record<string, FragmentListItem[]>
}

export interface FragmentDetail {
  name: string
  category: string
  description: string
  required: boolean
  condition?: string
  source: 'builtin' | 'user'
  raw: string
  datasets?: string[]
  usedBy?: string[]
  isCustom: boolean
}

export interface FragmentPreviewRequest {
  module?: string
  data?: Record<string, unknown>
}

export interface FragmentPreviewResponse {
  name: string
  rendered?: string
  error?: string
  stats?: TokenStats
}

export interface FragmentSaveRequest {
  content: string
}

export interface FragmentSaveResponse {
  name: string
  path: string
  isNew: boolean
  message: string
}

export interface FragmentCreateRequest {
  name: string
  content: string
}

export interface FragmentDeleteResponse {
  name: string
  message: string
}

export interface FragmentValidateRequest {
  content: string
}

export interface FragmentValidateResponse {
  valid: boolean
  error?: string
}

export interface FragmentBuiltinResponse {
  name: string
  content: string
  exists: boolean
}

export interface DatasetInfo {
  name: string
  description: string
  type: string
  fields?: string[]
  dynamic: boolean
}

export interface DatasetsListResponse {
  datasets: DatasetInfo[]
}

export interface DatasetDetail {
  name: string
  description: string
  type: string
  fields?: string[]
  dynamic: boolean
  sample?: Record<string, unknown>
  usedBy?: string[]
  isCustom: boolean
  raw?: string
}

export interface DatasetSaveResponse {
  name: string
  path: string
  isNew: boolean
  message: string
}

export interface DatasetDeleteResponse {
  name: string
  message: string
}

export interface DatasetValidateResponse {
  valid: boolean
  error?: string
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
  docs: string // "ok", "pending", "stale", "gaps"
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
  status: string // "pass", "warn", "fail"
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

  async runCollect(): Promise<CollectResult> {
    return this.fetch<CollectResult>('/commands/collect', {
      method: 'POST',
    })
  }

  // Template Editor API methods
  async getTemplates(intent?: string): Promise<TemplatesListResponse> {
    const query = intent ? `?intent=${encodeURIComponent(intent)}` : ''
    return this.fetch<TemplatesListResponse>(`/templates${query}`)
  }

  async getTemplate(name: string): Promise<TemplateDetail> {
    return this.fetch<TemplateDetail>(`/templates/${encodeURIComponent(name)}`)
  }

  async previewTemplate(name: string, request?: TemplatePreviewRequest): Promise<TemplatePreviewResponse> {
    return this.fetch<TemplatePreviewResponse>(`/templates/${encodeURIComponent(name)}/preview`, {
      method: 'POST',
      body: JSON.stringify(request ?? {}),
    })
  }

  async saveTemplate(name: string, content: string): Promise<TemplateSaveResponse> {
    return this.fetch<TemplateSaveResponse>(`/templates/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async resetTemplate(name: string): Promise<TemplateResetResponse> {
    return this.fetch<TemplateResetResponse>(`/templates/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
  }

  async validateTemplate(name: string, content: string): Promise<TemplateValidateResponse> {
    return this.fetch<TemplateValidateResponse>(`/templates/${encodeURIComponent(name)}/validate`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async getBuiltinTemplate(name: string): Promise<TemplateBuiltinResponse> {
    return this.fetch<TemplateBuiltinResponse>(`/templates/${encodeURIComponent(name)}/builtin`)
  }

  async getFragments(category?: string, grouped?: boolean): Promise<FragmentsListResponse> {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (grouped) params.set('grouped', 'true')
    const query = params.toString() ? `?${params}` : ''
    return this.fetch<FragmentsListResponse>(`/fragments${query}`)
  }

  async getFragment(name: string): Promise<FragmentDetail> {
    return this.fetch<FragmentDetail>(`/fragments/${encodeURIComponent(name)}`)
  }

  async previewFragment(name: string, request?: FragmentPreviewRequest): Promise<FragmentPreviewResponse> {
    return this.fetch<FragmentPreviewResponse>(`/fragments/${encodeURIComponent(name)}/preview`, {
      method: 'POST',
      body: JSON.stringify(request ?? {}),
    })
  }

  async saveFragment(name: string, content: string): Promise<FragmentSaveResponse> {
    return this.fetch<FragmentSaveResponse>(`/fragments/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async createFragment(name: string, content: string): Promise<FragmentSaveResponse> {
    return this.fetch<FragmentSaveResponse>('/fragments', {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    })
  }

  async deleteFragment(name: string): Promise<FragmentDeleteResponse> {
    return this.fetch<FragmentDeleteResponse>(`/fragments/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
  }

  async validateFragment(name: string, content: string): Promise<FragmentValidateResponse> {
    return this.fetch<FragmentValidateResponse>(`/fragments/${encodeURIComponent(name)}/validate`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async getBuiltinFragment(name: string): Promise<FragmentBuiltinResponse> {
    return this.fetch<FragmentBuiltinResponse>(`/fragments/${encodeURIComponent(name)}/builtin`)
  }

  async getDatasets(): Promise<DatasetsListResponse> {
    return this.fetch<DatasetsListResponse>('/datasets')
  }

  async getDataset(name: string): Promise<DatasetDetail> {
    return this.fetch<DatasetDetail>(`/datasets/${encodeURIComponent(name)}`)
  }

  async saveDataset(name: string, content: string): Promise<DatasetSaveResponse> {
    return this.fetch<DatasetSaveResponse>(`/datasets/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async createDataset(name: string, content: string): Promise<DatasetSaveResponse> {
    return this.fetch<DatasetSaveResponse>('/datasets', {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    })
  }

  async deleteDataset(name: string): Promise<DatasetDeleteResponse> {
    return this.fetch<DatasetDeleteResponse>(`/datasets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
  }

  async validateDataset(content: string): Promise<DatasetValidateResponse> {
    return this.fetch<DatasetValidateResponse>('/datasets/validate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
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
