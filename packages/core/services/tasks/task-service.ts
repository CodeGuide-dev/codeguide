import { BaseService } from '../base/base-service';
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
} from './task-types';

export class TaskService extends BaseService {
  // Task Groups
  async getAllTaskGroups(): Promise<TaskGroup[]> {
    const response = await this.get<TaskGroupListResponse>('/task-groups');
    return response.data;
  }

  async getPaginatedTaskGroups(
    params: PaginatedTaskGroupsRequest
  ): Promise<PaginatedTaskGroupsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.page_size !== undefined)
      queryParams.append('page_size', params.page_size.toString());
    if (params.project_id) queryParams.append('project_id', params.project_id);

    const url = `/task-groups/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<PaginatedTaskGroupsResponse>(url);
  }

  async getTaskGroupById(taskGroupId: string): Promise<TaskGroup> {
    const response = await this.get<TaskGroupResponse>(`/task-groups/${taskGroupId}`);
    return response.data;
  }

  async createTaskGroup(request: CreateTaskGroupRequest): Promise<TaskGroup> {
    const response = await this.post<TaskGroupResponse>('/task-groups', request);
    return response.data;
  }

  async updateTaskGroup(taskGroupId: string, request: UpdateTaskGroupRequest): Promise<TaskGroup> {
    const response = await this.put<TaskGroupResponse>(`/task-groups/${taskGroupId}`, request);
    return response.data;
  }

  async deleteTaskGroup(taskGroupId: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/task-groups/${taskGroupId}`);
  }

  // Project Tasks
  async getAllProjectTasks(filters?: {
    task_group_id?: string;
    parent_task_id?: string;
    status?: string;
  }): Promise<ProjectTask[]> {
    const queryParams = new URLSearchParams();

    if (filters?.task_group_id) queryParams.append('task_group_id', filters.task_group_id);
    if (filters?.parent_task_id) queryParams.append('parent_task_id', filters.parent_task_id);
    if (filters?.status) queryParams.append('status', filters.status);

    const url = `/project-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.get<ProjectTaskListResponse>(url);
    return response.data;
  }

  async getPaginatedProjectTasks(
    params: PaginatedProjectTasksRequest
  ): Promise<PaginatedProjectTasksResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.page_size !== undefined)
      queryParams.append('page_size', params.page_size.toString());
    if (params.task_group_id) queryParams.append('task_group_id', params.task_group_id);
    if (params.parent_task_id) queryParams.append('parent_task_id', params.parent_task_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.search_query) queryParams.append('search_query', params.search_query);

    const url = `/project-tasks/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<PaginatedProjectTasksResponse>(url);
  }

  async getProjectTaskById(taskId: string): Promise<ProjectTask> {
    const response = await this.get<ProjectTaskResponse>(`/project-tasks/${taskId}`);
    return response.data;
  }

  async createProjectTask(request: CreateProjectTaskRequest): Promise<ProjectTask> {
    const response = await this.post<ProjectTaskResponse>('/project-tasks', request);
    return response.data;
  }

  async updateProjectTask(taskId: string, request: UpdateProjectTaskRequest): Promise<ProjectTask> {
    const response = await this.put<ProjectTaskResponse>(`/project-tasks/${taskId}`, request);
    return response.data;
  }

  async deleteProjectTask(taskId: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/project-tasks/${taskId}`);
  }
}
