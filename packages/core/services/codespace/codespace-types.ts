export interface GenerateTaskTitleRequest {
  task_description: string
}

export interface GenerateTaskTitleResponse {
  success: boolean
  title: string
  message: string
  fallback_used: boolean
}

export interface CreateCodespaceTaskRequest {
  title: string
  description: string
}

export interface CreateCodespaceTaskResponse {
  success: boolean
  task_id: string
  message: string
}

export interface ModelApiKey {
  model_name: string
  api_key: string
}

export interface Attachment {
  filename: string
  file_data: string // bytes (base64)
  mime_type: string
  file_size: number
  description?: string
}

export interface CreateCodespaceTaskRequestV2 {
  project_id: string
  project_repository_id?: string
  task_description: string
  title?: string
  branch?: string
  working_branch?: string
  base_branch?: string
  docs_url?: string
  model_api_keys?: ModelApiKey[]
  github_token?: string
  codespace_task_id?: string
  execution_mode?: 'implementation' | 'docs-only'
  model_name?: string
  starter_kit_repo?: string
  use_enhanced_summary?: boolean
  attachments?: Attachment[]
  ai_questionnaire?: Record<string, string>
}

export interface CreateCodespaceTaskResponseV2 {
  success: boolean
  task_id: string
  message: string
  status?: string
  created_at?: string
}

export interface TechnicalDocument {
  version: string
  generated_at: string
  task_summary: {
    estimated_scope: string
    enriched_description: string
    original_description: string
    complexity_assessment: string
  }
  repository_analysis: {
    entry_points: string[]
    key_components: string[]
    technology_stack: string[]
    structure_overview: string
    architecture_patterns: string[]
  }
  contextual_requirements: {
    dependencies: string[]
    related_functionality: string
    testing_considerations: string
    deployment_considerations: string
  }
  implementation_guidance: {
    best_practices: string[]
    suggested_approach: string
    key_files_to_modify: string[]
    potential_challenges: string[]
  }
}

export interface CodespaceTaskData {
  id: string
  codespace_task_id: string | null
  project_id: string
  project_repository_id: string
  user_id: string
  status: string
  progress: string
  created_at: string
  updated_at: string
  completed_at: string | null
  title: string
  task_description: string
  base_branch: string
  working_branch: string
  github_token_hash: string | null
  pull_request_url: string | null
  pull_request_number: number | null
  work_started_at: string | null
  work_completed_at: string | null
  estimated_completion_time: string | null
  ai_implementation_plan: string | null
  metadata: any
  model_id: string | null
  execution_mode: string
  context_data: any
  final_report_popup_state: string
  technical_document: TechnicalDocument | null
  model: any
  task_models: any[]
}

export interface GetCodespaceTaskResponse {
  status: string
  data: CodespaceTaskData
}

export interface GetProjectTasksByCodespaceResponse {
  status: string
  data: any[] // Will be defined based on the actual response structure
}

export interface CreateBackgroundCodespaceTaskRequest extends CreateCodespaceTaskRequestV2 {}

export interface CreateBackgroundCodespaceTaskResponse extends CreateCodespaceTaskResponseV2 {}

// Request parameters for getting codespace tasks by project
export interface GetCodespaceTasksByProjectRequest {
  project_id: string
  status?: 'completed' | 'failed' | 'in_progress' | 'created' | 'cancelled'
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Response for getting codespace tasks by project
export interface GetCodespaceTasksByProjectResponse {
  status: string
  data: CodespaceTaskData[]
  total_count: number
  message: string
}

// Response for getting detailed codespace task with relations
export interface CodespaceTaskDetailedResponse {
  status: string
  data: {
    task: CodespaceTaskData
    project: any // Project data structure
    repository: any // Repository data structure
    usage_summary: any // Usage statistics
  }
  message: string
}

export interface CodespaceQuestionnaireRequest {
  task_description: string
  project_context?: string
  repository_info?: {
    name?: string
    description?: string
  }
  attachments?: Attachment[]
}

export interface CodespaceQuestionnaireResponse {
  success: boolean
  questions: string[]
  message: string
}

// ============================================================================
// Codespace Models Types
// ============================================================================

export interface LLMModelProviderInDB {
  id: string
  created_at: string
  name?: string
  key?: string
  logo_src?: string
}

export interface CodespaceModelInDB {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
}

export interface CodespaceModelWithProvider extends CodespaceModelInDB {
  provider?: LLMModelProviderInDB
}

export interface GetCodespaceModelsQuery {
  provider_id?: string
  execution_mode?: string
}

export interface GetCodespaceModelsResponse extends Array<CodespaceModelWithProvider> {}

export interface GetCodespaceModelResponse extends CodespaceModelWithProvider {}

export interface GetLLMModelProvidersResponse extends Array<LLMModelProviderInDB> {}

export interface GetLLMModelProviderResponse extends LLMModelProviderInDB {}

export interface GetModelsByProviderResponse extends Array<CodespaceModelInDB> {}

// ============================================================================
// Codespace Models Error Types
// ============================================================================

export interface CodespaceModelNotFoundError {
  detail: string // "Codespace model with ID {model_id} not found"
}

export interface AuthenticationRequiredError {
  detail: string // "Authentication required"
}

export interface CodespaceModelsFetchError {
  detail: string // "Failed to fetch codespace models"
}

export type CodespaceModelsError =
  | CodespaceModelNotFoundError
  | AuthenticationRequiredError
  | CodespaceModelsFetchError