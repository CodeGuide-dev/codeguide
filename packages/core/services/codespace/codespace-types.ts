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
  conversation_id?: string
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
  execution_mode?: 'implementation' | 'docs-only' | 'direct'
  model_name?: string
  starter_kit_repo?: string
  use_enhanced_summary?: boolean
  attachments?: Attachment[]
  ai_questionnaire?: Record<string, string>
  conversation_id?: string
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

export interface TaskMetadata {
  job_id?: string
  completed_at?: string
  processing_duration_ms?: number
}

export interface CodespaceTaskData {
  id: string
  codespace_task_id: string | null
  project_id: string
  project_repository_id: string | null
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
  metadata: TaskMetadata | null
  model_id: string | null
  execution_mode: string
  context_data: any
  final_report_popup_state: 'not_ready' | 'open' | 'closed'
  technical_document: TechnicalDocument | null
  ai_questionnaire: Record<string, string> | null
  model: TaskModel | null
  task_models: TaskModelEntry[]
  docs_url: string | null
  github_token: string | null
  attachments: TaskAttachment[] | null
}

export interface GetCodespaceTaskResponse {
  status: string
  data: CodespaceTaskData
}

// Codespace Project Task interface for the response structure
export interface CodespaceProjectTask {
  id: string
  title: string
  description: string
  details: string
  status: string
  test_strategy: string
  priority: string
  ordinal: number
  task_group_id: string
  parent_task_id: string
  ai_result: string
  created_at: string
  user_id: string
  subtasks: CodespaceProjectTask[]
}

export interface CodespaceProjectTaskListResponse {
  status: string
  data: CodespaceProjectTask[]
}

export interface GetProjectTasksByCodespaceResponse extends CodespaceProjectTaskListResponse {}

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
export interface GetCodespaceTasksByProjectResponse extends GetCodespaceTasksCommonResponse {}

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

// ============================================================================
// Codespace Tasks with Model Information Types
// ============================================================================

export interface AttachmentResponse {
  id: string
  filename: string
  file_data: string
  mime_type: string
  file_size: number
  description?: string
  created_at: string
}

export interface CodespaceTaskModelInDB {
  id: string
  created_at: string
  codespace_task_id: string
  model_id: string
  model_name?: string
  model_key?: string
  provider_id?: string
  provider_name?: string
  execution_mode?: string
}

export interface CodespaceTasksListResponse extends GetCodespaceTasksCommonResponse {}

// Common response interface for all paginated codespace task lists
export interface GetCodespaceTasksCommonResponse {
  status: string
  data: CodespaceTaskData[]
  total_count: number
  message: string
}


// ============================================================================
// GET /codespace/tasks Endpoint Types
// ============================================================================

// Request parameters for getting codespace tasks
export interface GetCodespaceTasksRequest {
  task_status?: 'completed' | 'in_progress' | 'failed'
  project_id?: string
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'updated_at' | 'status' | 'title'
  sort_order?: 'asc' | 'desc'
}

// Attachment data structure for task response
export interface TaskAttachment {
  id: string
  codespace_task_id: string
  filename: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

// Model information for task response
export interface TaskModel {
  id: string
  created_at: string
  key: string
  name: string
  provider_id: string
  base_url: string | null
  completion_base_url: string | null
  execution_mode: string
  logo_src: string | null
  provider: {
    id: string
    created_at: string
    name: string
    key: string
    logo_src: string | null
  }
}

// Task model junction table entry
export interface TaskModelEntry {
  id: string
  codespace_task_id: string
  codespace_model_id: string
  created_at: string
}

// Main task data structure for /codespace/tasks response
// Uses the same CodespaceTaskData interface defined above

// Response for GET /codespace/tasks endpoint
export interface GetCodespaceTasksResponse extends GetCodespaceTasksCommonResponse {}

// ============================================================================
// GET /tasks/by-codespace-id/{codespace_task_id} Endpoint Types
// ============================================================================

// Request parameters for GET /tasks/by-codespace-id/{codespace_task_id} endpoint
export interface GetTasksByCodespaceIdRequest {
  codespace_task_id: string
  limit?: number // Maximum number of tasks to return (default: 50, max: 100)
  offset?: number // Number of tasks to skip for pagination (default: 0)
  sort_by?: 'created_at' | 'updated_at' | 'status' | 'title' // Field to sort by (default: created_at)
  sort_order?: 'asc' | 'desc' // Sort order (default: desc)
}

// Response for GET /tasks/by-codespace-id/{codespace_task_id} endpoint
export interface GetTasksByCodespaceIdResponse {
  status: string
  data: CodespaceTaskData[]
  total_count: number
  message: string
}

// ============================================================================
// Final Report Popup State Types
// ============================================================================

export interface UpdateFinalReportPopupStateRequest {
  final_report_popup_state: 'not_ready' | 'open' | 'closed'
}

export interface UpdateFinalReportPopupStateResponse {
  status: string
  message: string
  codespace_task_id: string
  final_report_popup_state: 'not_ready' | 'open' | 'closed'
}

// ============================================================================
// Codespace Task Logs Types
// ============================================================================

// Log type union for type safety
export type CodespaceLogType = 'thinking' | 'coding' | 'info' | 'error' | 'success'

// Single log entry structure
export interface CodespaceTaskLog {
  id: string
  codespace_task_id: string
  step_name: string
  log_type: CodespaceLogType
  message: string
  created_at: string // ISO timestamp
  progress_percentage?: number // 0-100
  metadata?: Record<string, any>
}

// Request parameters for getting paginated logs
export interface GetCodespaceTaskLogsRequest {
  codespace_task_id: string
  limit?: number // 1-500, default: 50
  offset?: number // default: 0
  log_type?: CodespaceLogType // Filter by log type
  step_name?: string // Filter by step name (partial matching)
  search?: string // Search in message content
  sort_by?: 'created_at' | 'step_name' | 'log_type' // Sort field, default: created_at
  sort_order?: 'asc' | 'desc' // Sort order, default: desc
  since?: string // Get logs after timestamp (ISO format)
}

// Response for paginated logs request
export interface CodespaceTaskLogsResponse {
  status: string
  data: CodespaceTaskLog[]
  total_count: number
  has_more: boolean
  next_offset?: number
  message: string
}

// Request parameters for streaming logs
export interface StreamCodespaceTaskLogsRequest {
  codespace_task_id: string
  since?: string // Start from timestamp (ISO format)
  timeout?: number // Stream timeout in seconds (30-1800, default: 300)
}

// Event types for streaming (for TypeScript interfaces)
export interface StreamLogEvent {
  event: 'log'
  data: CodespaceTaskLog
}

export interface StreamHeartbeatEvent {
  event: 'heartbeat'
  data: {
    timestamp: string
  }
}

export interface StreamCompleteEvent {
  event: 'complete'
  data: {
    message: string
  }
}

export interface StreamTimeoutEvent {
  event: 'timeout'
  data: {
    message: string
  }
}

export interface StreamErrorEvent {
  event: 'error'
  data: {
    error: string
  }
}

// Union type for all possible stream events
export type CodespaceLogStreamEvent =
  | StreamLogEvent
  | StreamHeartbeatEvent
  | StreamCompleteEvent
  | StreamTimeoutEvent
  | StreamErrorEvent

