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