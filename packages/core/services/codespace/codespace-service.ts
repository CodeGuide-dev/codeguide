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
} from './codespace-types'

export class CodespaceService extends BaseService {
  async generateTaskTitle(request: GenerateTaskTitleRequest): Promise<GenerateTaskTitleResponse> {
    return this.post<GenerateTaskTitleResponse>('/codespace/generate-task-title', request)
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
  }
}
