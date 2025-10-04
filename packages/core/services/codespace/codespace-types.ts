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
}

export interface CreateCodespaceTaskResponseV2 {
  success: boolean
  task_id: string
  message: string
  status?: string
  created_at?: string
}

export interface CreateBackgroundCodespaceTaskRequest extends CreateCodespaceTaskRequestV2 {}

export interface CreateBackgroundCodespaceTaskResponse extends CreateCodespaceTaskResponseV2 {}