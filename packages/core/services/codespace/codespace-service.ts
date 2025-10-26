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
} from './codespace-types'

export class CodespaceService extends BaseService {
  async generateTaskTitle(request: GenerateTaskTitleRequest): Promise<GenerateTaskTitleResponse> {
    return this.post<GenerateTaskTitleResponse>('/codespace/generate-task-title', request)
  }

  async generateQuestionnaire(request: CodespaceQuestionnaireRequest): Promise<CodespaceQuestionnaireResponse> {
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
    const url = params
      ? `/api/codespace-models/models?${params}`
      : '/api/codespace-models/models'

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
    return this.get<GetModelsByProviderResponse>(`/api/codespace-models/providers/${providerId}/models`)
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
      !['implementation', 'docs-only'].includes(request.execution_mode)
    ) {
      throw new Error('execution_mode must be either "implementation" or "docs-only"')
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
}
