export interface TaskGroup {
  id: string
  name: string
  description?: string
  user_id: string
  project_id: string
  created_at: string
  updated_at: string
  project_tasks: ProjectTask[]
}

export interface ProjectTask {
  id: string
  title: string
  description?: string
  status: string
  user_id: string
  task_group_id: string
  parent_task_id?: string
  ordinal: number
  created_at: string
  updated_at: string
  subtasks?: ProjectTask[]
}

export interface CreateTaskGroupRequest {
  name: string
  description?: string
  project_id: string
}

export interface UpdateTaskGroupRequest {
  name?: string
  description?: string
  project_id?: string
}

export interface CreateProjectTaskRequest {
  title: string
  description?: string
  task_group_id: string
  parent_task_id?: string
  ordinal?: number
}

export interface UpdateProjectTaskRequest {
  title?: string
  description?: string
  status?: string
  task_group_id?: string
  parent_task_id?: string
  ordinal?: number
}

export interface TaskGroupListResponse {
  status: string
  data: TaskGroup[]
}

export interface TaskGroupResponse {
  status: string
  data: TaskGroup
}

export interface ProjectTaskListResponse {
  status: string
  data: ProjectTask[]
}

export interface ProjectTaskResponse {
  status: string
  data: ProjectTask
}

export interface PaginatedTaskGroupsRequest {
  page?: number
  page_size?: number
  project_id?: string
}

export interface PaginatedTaskGroupsResponse {
  status: string
  data: TaskGroup[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface PaginatedProjectTasksRequest {
  page?: number
  page_size?: number
  task_group_id?: string
  parent_task_id?: string
  status?: string
  search_query?: string
}

export interface PaginatedProjectTasksResponse {
  status: string
  data: ProjectTask[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface GenerateTasksRequest {
  project_id: string
}

export interface GenerateTasksResponse {
  status: string
  message: string
  data?: {
    task_groups_created: number
    tasks_created: number
  }
}

export interface GetTasksByProjectRequest {
  project_id: string
  status?: string
  task_group_id?: string
}

export interface GetTasksByProjectResponse {
  status: string
  data: {
    task_groups: TaskGroup[]
    tasks: ProjectTask[]
  }
}

export interface StartTaskRequest {
  task_id: string
}

export interface StartTaskResponse {
  status: string
  message: string
  data: {
    task: ProjectTask
  }
}

export interface UpdateTaskRequest {
  task_id: string
  status?: string
  ai_result?: string
  title?: string
  description?: string
}

export interface UpdateTaskResponse {
  status: string
  message: string
  data: {
    task: ProjectTask
  }
}
