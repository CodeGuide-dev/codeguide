import { BaseService } from '../base/base-service'
import {
  GenerateTaskTitleRequest,
  GenerateTaskTitleResponse,
  CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponse,
} from './codespace-types'

export class CodespaceService extends BaseService {
  async generateTaskTitle(request: GenerateTaskTitleRequest): Promise<GenerateTaskTitleResponse> {
    return this.post<GenerateTaskTitleResponse>('/codespace/generate-task-title', request)
  }

  async createCodespaceTask(request: CreateCodespaceTaskRequest): Promise<CreateCodespaceTaskResponse> {
    return this.post<CreateCodespaceTaskResponse>('/codespace/create-task', request)
  }
}