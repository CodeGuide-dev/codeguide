import { BaseService } from '../base/base-service'
import {
  GenerateTaskTitleRequest,
  GenerateTaskTitleResponse,
  CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponse,
  CreateCodespaceTaskRequestV2,
  CreateCodespaceTaskResponseV2,
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  GetCodespaceTaskResponse,
  GetProjectTasksByCodespaceResponse,
  GetCodespaceTasksByProjectRequest,
  GetCodespaceTasksByProjectResponse,
  CodespaceTaskDetailedResponse,
  CodespaceQuestionnaireRequest,
  CodespaceQuestionnaireResponse,
  // Codespace Models Types
  GetCodespaceModelsQuery,
  GetCodespaceModelsResponse,
  GetCodespaceModelResponse,
  GetLLMModelProvidersResponse,
  GetLLMModelProviderResponse,
  GetModelsByProviderResponse,
  // GET /codespace/tasks Types
  GetCodespaceTasksRequest,
  GetCodespaceTasksResponse,
  // GET /tasks/by-codespace-id Types
  GetTasksByCodespaceIdRequest,
  GetTasksByCodespaceIdResponse,
  // Final Report Popup State Types
  UpdateFinalReportPopupStateRequest,
  UpdateFinalReportPopupStateResponse,
  // Codespace Task Logs Types
  GetCodespaceTaskLogsRequest,
  CodespaceTaskLogsResponse,
  StreamCodespaceTaskLogsRequest,
  CodespaceLogStreamEvent,
} from './codespace-types'

export class CodespaceService extends BaseService {
  async generateTaskTitle(request: GenerateTaskTitleRequest): Promise<GenerateTaskTitleResponse> {
    return this.post<GenerateTaskTitleResponse>('/codespace/generate-task-title', request)
  }

  async generateQuestionnaire(
    request: CodespaceQuestionnaireRequest
  ): Promise<CodespaceQuestionnaireResponse> {
    this.validateQuestionnaireRequest(request)
    return this.post<CodespaceQuestionnaireResponse>('/codespace/generate-questionnaire', request)
  }

  async createCodespaceTask(
    request: CreateCodespaceTaskRequest
  ): Promise<CreateCodespaceTaskResponse> {
    return this.post<CreateCodespaceTaskResponse>('/codespace/create-task', request)
  }

  async createCodespaceTaskV2(
    request: CreateCodespaceTaskRequestV2
  ): Promise<CreateCodespaceTaskResponseV2> {
    this.validateCodespaceTaskRequest(request)
    return this.post<CreateCodespaceTaskResponseV2>('/codespace/task', request)
  }

  async createBackgroundCodespaceTask(
    request: CreateBackgroundCodespaceTaskRequest
  ): Promise<CreateBackgroundCodespaceTaskResponse> {
    this.validateCodespaceTaskRequest(request)
    return this.post<CreateBackgroundCodespaceTaskResponse>('/codespace/task/background', request)
  }

  async getCodespaceTask(codespaceTaskId: string): Promise<GetCodespaceTaskResponse> {
    if (!codespaceTaskId) {
      throw new Error('codespace_task_id is required')
    }
    return this.get<GetCodespaceTaskResponse>(`/codespace/task/${codespaceTaskId}`)
  }

  async getProjectTasksByCodespace(
    codespaceTaskId: string
  ): Promise<GetProjectTasksByCodespaceResponse> {
    if (!codespaceTaskId) {
      throw new Error('codespace_task_id is required')
    }
    return this.get<GetProjectTasksByCodespaceResponse>(
      `/project-tasks/by-codespace/${codespaceTaskId}`
    )
  }

  async getCodespaceTasksByProject(
    params: GetCodespaceTasksByProjectRequest
  ): Promise<GetCodespaceTasksByProjectResponse> {
    if (!params.project_id) {
      throw new Error('project_id is required')
    }

    const queryParams = new URLSearchParams()

    if (params.status) queryParams.append('status', params.status)
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params.sort_order) queryParams.append('sort_order', params.sort_order)

    const url = `/codespace/tasks/project/${params.project_id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<GetCodespaceTasksByProjectResponse>(url)
  }

  async getCodespaceTaskDetailed(codespaceTaskId: string): Promise<CodespaceTaskDetailedResponse> {
    if (!codespaceTaskId) {
      throw new Error('codespace_task_id is required')
    }
    return this.get<CodespaceTaskDetailedResponse>(`/codespace/task/${codespaceTaskId}/detailed`)
  }

  /**
   * Get tasks by codespace task ID with optional pagination and sorting
   *
   * GET /tasks/by-codespace-id/{codespace_task_id}
   *
   * @param params - Request parameters including codespace_task_id and optional pagination/sorting
   * @returns Promise resolving to paginated list of tasks associated with the codespace task ID
   */
  async getTasksByCodespaceId(
    params: GetTasksByCodespaceIdRequest
  ): Promise<GetTasksByCodespaceIdResponse> {
    this.validateGetTasksByCodespaceIdRequest(params)

    const queryParams = new URLSearchParams()

    // Add pagination parameters
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString())
    }

    // Add sorting parameters
    if (params.sort_by) {
      queryParams.append('sort_by', params.sort_by)
    }
    if (params.sort_order) {
      queryParams.append('sort_order', params.sort_order)
    }

    const url = `/tasks/by-codespace-id/${params.codespace_task_id}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    return this.get<GetTasksByCodespaceIdResponse>(url)
  }

  /**
   * Get codespace tasks with optional filtering and pagination
   *
   * GET /codespace/tasks
   *
   * @param params - Optional query parameters for filtering, sorting, and pagination
   * @returns Promise resolving to paginated list of codespace tasks with model and attachment info
   */
  async getCodespaceTasks(params?: GetCodespaceTasksRequest): Promise<GetCodespaceTasksResponse> {
    const queryParams = new URLSearchParams()

    if (params?.task_status) queryParams.append('task_status', params.task_status)
    if (params?.project_id) queryParams.append('project_id', params.project_id)
    if (params?.limit !== undefined) {
      // Validate limit is between 1 and 100
      if (params.limit < 1 || params.limit > 100) {
        throw new Error('limit must be between 1 and 100')
      }
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      // Validate offset is non-negative
      if (params.offset < 0) {
        throw new Error('offset must be 0 or greater')
      }
      queryParams.append('offset', params.offset.toString())
    }
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

    const url = `/codespace/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<GetCodespaceTasksResponse>(url)
  }

  // ============================================================================
  // Task Status Update Methods
  // ============================================================================

  /**
   * Update the final report popup state for a codespace task
   *
   * PATCH /task/{codespace_task_id}/final-report-popup-state
   *
   * @param codespaceTaskId - The ID of the codespace task
   * @param request - The request body containing the new popup state
   * @returns Promise resolving to the updated popup state response
   */
  async updateFinalReportPopupState(
    codespaceTaskId: string,
    request: UpdateFinalReportPopupStateRequest
  ): Promise<UpdateFinalReportPopupStateResponse> {
    if (!codespaceTaskId) {
      throw new Error('codespace_task_id is required')
    }

    // Validate the popup state value
    if (!['not_ready', 'open', 'closed'].includes(request.final_report_popup_state)) {
      throw new Error('final_report_popup_state must be "not_ready", "open", or "closed"')
    }

    return this.patch<UpdateFinalReportPopupStateResponse>(
      `/task/${codespaceTaskId}/final-report-popup-state`,
      request
    )
  }

  // ============================================================================
  // Codespace Task Logs Methods
  // ============================================================================

  /**
   * Get paginated logs for a codespace task with optional filtering and sorting
   *
   * GET /codespace/task/{codespace_task_id}/logs
   *
   * @param request - Request parameters including codespace_task_id and optional filters
   * @returns Promise resolving to paginated logs response
   */
  async getCodespaceTaskLogs(
    request: GetCodespaceTaskLogsRequest
  ): Promise<CodespaceTaskLogsResponse> {
    this.validateGetLogsRequest(request)

    const queryParams = new URLSearchParams()

    // Add pagination parameters
    if (request.limit !== undefined) {
      queryParams.append('limit', request.limit.toString())
    }
    if (request.offset !== undefined) {
      queryParams.append('offset', request.offset.toString())
    }

    // Add filter parameters
    if (request.log_type) {
      queryParams.append('log_type', request.log_type)
    }
    if (request.step_name) {
      queryParams.append('step_name', request.step_name)
    }
    if (request.search) {
      queryParams.append('search', request.search)
    }
    if (request.since) {
      queryParams.append('since', request.since)
    }

    // Add sorting parameters
    if (request.sort_by) {
      queryParams.append('sort_by', request.sort_by)
    }
    if (request.sort_order) {
      queryParams.append('sort_order', request.sort_order)
    }

    const url = `/codespace/task/${request.codespace_task_id}/logs${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    return this.get<CodespaceTaskLogsResponse>(url)
  }

  /**
   * Stream real-time logs from a codespace task using Server-Sent Events (SSE)
   *
   * GET /codespace/task/{codespace_task_id}/logs/stream
   *
   * @param request - Request parameters including codespace_task_id and optional streaming parameters
   * @param onLog - Callback function for handling log events
   * @param onHeartbeat - Callback function for handling heartbeat events
   * @param onComplete - Callback function for handling completion events
   * @param onError - Callback function for handling error events
   * @param onTimeout - Callback function for handling timeout events
   * @returns Promise resolving to a cleanup function to stop streaming
   */
  async streamCodespaceTaskLogs(
    request: StreamCodespaceTaskLogsRequest,
    onLog: (log: CodespaceLogStreamEvent) => void,
    onHeartbeat?: (data: any) => void,
    onComplete?: (data: any) => void,
    onError?: (error: any) => void,
    onTimeout?: (data: any) => void
  ): Promise<() => void> {
    this.validateStreamLogsRequest(request)

    const queryParams = new URLSearchParams()

    // Add streaming parameters
    if (request.since) {
      queryParams.append('since', request.since)
    }
    if (request.timeout !== undefined) {
      queryParams.append('timeout', request.timeout.toString())
    }

    const url = `/codespace/task/${request.codespace_task_id}/logs/stream${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    // Use the fetch-based streaming method since it supports custom headers for authentication
    return this.createStreamWithFetch(
      url,
      data => {
        // Handle different types of events based on the context
        // The server will send different event types through the same data channel
        onLog(data as CodespaceLogStreamEvent)
      },
      onError,
      () => onComplete?.({}) // Call onComplete with empty data when stream completes
    )
  }

  // ============================================================================
  // Codespace Models Methods
  // ============================================================================

  /**
   * Get all codespace models with optional filtering
   *
   * GET /api/codespace-models/models
   *
   * @param query - Optional query parameters for filtering
   * @returns Promise resolving to array of codespace models with provider info
   */
  async getCodespaceModels(query?: GetCodespaceModelsQuery): Promise<GetCodespaceModelsResponse> {
    const params = this.buildQueryParams(query)
    const url = params ? `/api/codespace-models/models?${params}` : '/api/codespace-models/models'

    return this.get<GetCodespaceModelsResponse>(url)
  }

  /**
   * Get a specific codespace model by ID
   *
   * GET /api/codespace-models/models/{model_id}
   *
   * @param modelId - The UUID of the model
   * @returns Promise resolving to the codespace model with provider info
   */
  async getCodespaceModel(modelId: string): Promise<GetCodespaceModelResponse> {
    if (!modelId) {
      throw new Error('model_id is required')
    }
    return this.get<GetCodespaceModelResponse>(`/api/codespace-models/models/${modelId}`)
  }

  /**
   * Get all LLM model providers
   *
   * GET /api/codespace-models/providers
   *
   * @returns Promise resolving to array of LLM model providers
   */
  async getLLMModelProviders(): Promise<GetLLMModelProvidersResponse> {
    return this.get<GetLLMModelProvidersResponse>('/api/codespace-models/providers')
  }

  /**
   * Get a specific LLM model provider by ID
   *
   * GET /api/codespace-models/providers/{provider_id}
   *
   * @param providerId - The UUID of the provider
   * @returns Promise resolving to the LLM model provider
   */
  async getLLMModelProvider(providerId: string): Promise<GetLLMModelProviderResponse> {
    if (!providerId) {
      throw new Error('provider_id is required')
    }
    return this.get<GetLLMModelProviderResponse>(`/api/codespace-models/providers/${providerId}`)
  }

  /**
   * Get models by provider
   *
   * GET /api/codespace-models/providers/{provider_id}/models
   *
   * @param providerId - The UUID of the provider
   * @returns Promise resolving to array of models from the specified provider
   */
  async getModelsByProvider(providerId: string): Promise<GetModelsByProviderResponse> {
    if (!providerId) {
      throw new Error('provider_id is required')
    }
    return this.get<GetModelsByProviderResponse>(
      `/api/codespace-models/providers/${providerId}/models`
    )
  }

  /**
   * Build URL query parameters from an object
   *
   * @param params - The parameters object
   * @returns URL query string
   */
  private buildQueryParams(params?: Record<string, any>): string {
    if (!params) return ''

    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return searchParams.toString()
  }

  private validateCodespaceTaskRequest(request: CreateCodespaceTaskRequestV2): void {
    if (!request.project_id) {
      throw new Error('project_id is required')
    }

    if (!request.task_description) {
      throw new Error('task_description is required')
    }

    if (
      request.execution_mode &&
      !['implementation', 'docs-only', 'direct'].includes(request.execution_mode)
    ) {
      throw new Error('execution_mode must be either "implementation", "docs-only", or "direct"')
    }

    // Validate model_api_keys if provided
    if (request.model_api_keys) {
      if (!Array.isArray(request.model_api_keys)) {
        throw new Error('model_api_keys must be an array')
      }

      for (const key of request.model_api_keys) {
        if (!key.model_name || typeof key.model_name !== 'string') {
          throw new Error('Each model_api_key must have a valid model_name string')
        }
        if (!key.api_key || typeof key.api_key !== 'string') {
          throw new Error('Each model_api_key must have a valid api_key string')
        }
      }
    }

    // Validate base_branch default
    if (request.base_branch === undefined) {
      request.base_branch = 'main'
    }

    // Validate ai_questionnaire if provided
    if (request.ai_questionnaire) {
      if (typeof request.ai_questionnaire !== 'object' || request.ai_questionnaire === null) {
        throw new Error('ai_questionnaire must be an object')
      }

      // Check if it's a plain object with string keys and string values
      for (const [key, value] of Object.entries(request.ai_questionnaire)) {
        if (typeof key !== 'string') {
          throw new Error('All ai_questionnaire keys must be strings')
        }
        if (typeof value !== 'string') {
          throw new Error('All ai_questionnaire values must be strings')
        }
      }
    }
  }

  private validateQuestionnaireRequest(request: CodespaceQuestionnaireRequest): void {
    if (!request.task_description) {
      throw new Error('task_description is required')
    }

    // Validate attachments if provided
    if (request.attachments) {
      if (!Array.isArray(request.attachments)) {
        throw new Error('attachments must be an array')
      }

      for (const attachment of request.attachments) {
        // Check required fields
        if (!attachment.filename || typeof attachment.filename !== 'string') {
          throw new Error('Each attachment must have a valid filename string')
        }
        if (!attachment.file_data || typeof attachment.file_data !== 'string') {
          throw new Error('Each attachment must have valid file_data string')
        }
        if (!attachment.mime_type || typeof attachment.mime_type !== 'string') {
          throw new Error('Each attachment must have a valid mime_type string')
        }
        if (typeof attachment.file_size !== 'number' || attachment.file_size < 0) {
          throw new Error('Each attachment must have a valid file_size number (>= 0)')
        }

        // Validate optional description field
        if (attachment.description && typeof attachment.description !== 'string') {
          throw new Error('Attachment description must be a string if provided')
        }
      }
    }
  }

  private validateGetLogsRequest(request: GetCodespaceTaskLogsRequest): void {
    if (!request.codespace_task_id) {
      throw new Error('codespace_task_id is required')
    }

    // Validate limit
    if (request.limit !== undefined) {
      if (!Number.isInteger(request.limit)) {
        throw new Error('limit must be an integer')
      }
      if (request.limit < 1 || request.limit > 500) {
        throw new Error('limit must be between 1 and 500')
      }
    }

    // Validate offset
    if (request.offset !== undefined) {
      if (!Number.isInteger(request.offset)) {
        throw new Error('offset must be an integer')
      }
      if (request.offset < 0) {
        throw new Error('offset must be 0 or greater')
      }
    }

    // Validate sort_by
    if (request.sort_by && !['created_at', 'step_name', 'log_type'].includes(request.sort_by)) {
      throw new Error('sort_by must be one of: created_at, step_name, log_type')
    }

    // Validate sort_order
    if (request.sort_order && !['asc', 'desc'].includes(request.sort_order)) {
      throw new Error('sort_order must be either "asc" or "desc"')
    }

    // Validate log_type
    const validLogTypes = ['thinking', 'coding', 'info', 'error', 'success']
    if (request.log_type && !validLogTypes.includes(request.log_type)) {
      throw new Error(`log_type must be one of: ${validLogTypes.join(', ')}`)
    }

    // Validate since timestamp format (basic ISO format check)
    if (request.since) {
      const sinceDate = new Date(request.since)
      if (isNaN(sinceDate.getTime())) {
        throw new Error('since must be a valid ISO timestamp')
      }
    }
  }

  private validateStreamLogsRequest(request: StreamCodespaceTaskLogsRequest): void {
    if (!request.codespace_task_id) {
      throw new Error('codespace_task_id is required')
    }

    // Validate timeout
    if (request.timeout !== undefined) {
      if (!Number.isInteger(request.timeout)) {
        throw new Error('timeout must be an integer')
      }
      if (request.timeout < 30 || request.timeout > 1800) {
        throw new Error('timeout must be between 30 and 1800 seconds')
      }
    }

    // Validate since timestamp format (basic ISO format check)
    if (request.since) {
      const sinceDate = new Date(request.since)
      if (isNaN(sinceDate.getTime())) {
        throw new Error('since must be a valid ISO timestamp')
      }
    }
  }

  private validateGetTasksByCodespaceIdRequest(request: GetTasksByCodespaceIdRequest): void {
    if (!request.codespace_task_id) {
      throw new Error('codespace_task_id is required')
    }

    // Validate limit
    if (request.limit !== undefined) {
      if (!Number.isInteger(request.limit)) {
        throw new Error('limit must be an integer')
      }
      if (request.limit < 1 || request.limit > 100) {
        throw new Error('limit must be between 1 and 100')
      }
    }

    // Validate offset
    if (request.offset !== undefined) {
      if (!Number.isInteger(request.offset)) {
        throw new Error('offset must be an integer')
      }
      if (request.offset < 0) {
        throw new Error('offset must be 0 or greater')
      }
    }

    // Validate sort_by
    if (
      request.sort_by &&
      !['created_at', 'updated_at', 'status', 'title'].includes(request.sort_by)
    ) {
      throw new Error('sort_by must be one of: created_at, updated_at, status, title')
    }

    // Validate sort_order
    if (request.sort_order && !['asc', 'desc'].includes(request.sort_order)) {
      throw new Error('sort_order must be either "asc" or "desc"')
    }
  }
}
