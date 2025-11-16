import { BaseService } from '../base/base-service'
import {
  TaskGroup,
  ProjectTask,
  CreateTaskGroupRequest,
  UpdateTaskGroupRequest,
  CreateProjectTaskRequest,
  UpdateProjectTaskRequest,
  TaskGroupListResponse,
  TaskGroupResponse,
  ProjectTaskListResponse,
  ProjectTaskResponse,
  PaginatedTaskGroupsRequest,
  PaginatedTaskGroupsResponse,
  PaginatedProjectTasksRequest,
  PaginatedProjectTasksResponse,
  GenerateTasksRequest,
  GenerateTasksResponse,
  GetTasksByProjectRequest,
  GetTasksByProjectResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from './task-types'

export class TaskService extends BaseService {
  // Task Groups
  async getAllTaskGroups(): Promise<TaskGroup[]> {
    const response = await this.get<TaskGroupListResponse>('/task-groups')
    return response.data
  }

  async getPaginatedTaskGroups(
    params: PaginatedTaskGroupsRequest
  ): Promise<PaginatedTaskGroupsResponse> {
    const queryParams = new URLSearchParams()

    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString())
    if (params.project_id) queryParams.append('project_id', params.project_id)

    const url = `/task-groups/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<PaginatedTaskGroupsResponse>(url)
  }

  async getTaskGroupById(taskGroupId: string): Promise<TaskGroup> {
    const response = await this.get<TaskGroupResponse>(`/task-groups/${taskGroupId}`)
    return response.data
  }

  async createTaskGroup(request: CreateTaskGroupRequest): Promise<TaskGroup> {
    const response = await this.post<TaskGroupResponse>('/task-groups', request)
    return response.data
  }

  async createTaskGroupWithCodespace(
    request: CreateTaskGroupRequest,
    codespaceService: any
  ): Promise<TaskGroup> {
    // First, create the basic task group
    const taskGroupResponse = await this.post<TaskGroupResponse>('/task-groups', {
      name: request.name,
      description: request.description,
      project_id: request.project_id,
    })
    let taskGroup = taskGroupResponse.data

    // If codespace task creation is requested and project description is provided
    if (request.include_codespace_task && request.project_description) {
      try {
        // Step 1: Generate codespace task title using project description
        const titleResponse = await codespaceService.generateTaskTitle({
          task_description: request.project_description,
        })

        // Step 2: Create codespace task using generated title and project description
        const createTaskResponse = await codespaceService.createCodespaceTask({
          title: titleResponse.title,
          description: request.project_description,
        })

        // Step 3: Update task group with codespace_task_id
        const updateResponse = await this.updateTaskGroup(taskGroup.id, {
          codespace_task_id: createTaskResponse.task_id,
        })
        taskGroup = updateResponse
      } catch (error) {
        console.warn('Failed to create codespace task, but task group was created successfully:', error)
        // Continue without codespace task if it fails
      }
    }

    return taskGroup
  }

  async updateTaskGroup(taskGroupId: string, request: UpdateTaskGroupRequest): Promise<TaskGroup> {
    const response = await this.put<TaskGroupResponse>(`/project-tasks/task-groups/${taskGroupId}`, request)
    return response.data
  }

  async deleteTaskGroup(taskGroupId: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/task-groups/${taskGroupId}`)
  }

  // Project Tasks
  async getAllProjectTasks(filters?: {
    task_group_id?: string
    parent_task_id?: string
    status?: string
  }): Promise<ProjectTask[]> {
    const queryParams = new URLSearchParams()

    if (filters?.task_group_id) queryParams.append('task_group_id', filters.task_group_id)
    if (filters?.parent_task_id) queryParams.append('parent_task_id', filters.parent_task_id)
    if (filters?.status) queryParams.append('status', filters.status)

    const url = `/project-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.get<ProjectTaskListResponse>(url)
    return response.data
  }

  async getPaginatedProjectTasks(
    params: PaginatedProjectTasksRequest
  ): Promise<PaginatedProjectTasksResponse> {
    const queryParams = new URLSearchParams()

    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString())
    if (params.task_group_id) queryParams.append('task_group_id', params.task_group_id)
    if (params.parent_task_id) queryParams.append('parent_task_id', params.parent_task_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.search_query) queryParams.append('search_query', params.search_query)

    const url = `/project-tasks/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<PaginatedProjectTasksResponse>(url)
  }

  async getProjectTaskById(taskId: string): Promise<ProjectTask> {
    const response = await this.get<ProjectTaskResponse>(`/project-tasks/${taskId}`)
    return response.data
  }

  async createProjectTask(request: CreateProjectTaskRequest): Promise<ProjectTask> {
    const response = await this.post<ProjectTaskResponse>('/project-tasks', request)
    return response.data
  }

  async updateProjectTask(taskId: string, request: UpdateProjectTaskRequest): Promise<ProjectTask> {
    const response = await this.put<ProjectTaskResponse>(`/project-tasks/${taskId}`, request)
    return response.data
  }

  async deleteProjectTask(taskId: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/project-tasks/${taskId}`)
  }

  // Generate Tasks
  async generateTasks(request: GenerateTasksRequest): Promise<GenerateTasksResponse> {
    return this.post<GenerateTasksResponse>('/project-tasks/generate-tasks', request)
  }

  // Get Tasks by Project
  async getTasksByProject(request: GetTasksByProjectRequest): Promise<GetTasksByProjectResponse> {
    const queryParams = new URLSearchParams()

    if (request.status) queryParams.append('status', request.status)
    if (request.task_group_id) queryParams.append('task_group_id', request.task_group_id)

    const url = `/project-tasks/by-project/${request.project_id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<GetTasksByProjectResponse>(url)
  }

  // Update Task
  async updateTask(taskId: string, request: UpdateTaskRequest): Promise<UpdateTaskResponse> {
    return this.put<UpdateTaskResponse>(`/project-tasks/${taskId}`, request)
  }

  // Get Project Tasks by Codespace
  async getProjectTasksbyCodespace(codespaceTaskId: string): Promise<ProjectTaskListResponse> {
    if (!codespaceTaskId) {
      throw new Error('Codespace task ID is required')
    }

    const url = `/project-tasks/by-codespace/${codespaceTaskId}`
    return this.get<ProjectTaskListResponse>(url)
  }
}
