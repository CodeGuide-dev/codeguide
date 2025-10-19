import { Attachment } from '../codespace/codespace-types'

export interface AnalyzeRepositoryRequest {
  github_url: string
  github_token?: string
  generate_documents?: boolean
  create_codespace_task?: boolean
  project_id?: string
  codespace_task_description?: string
  codespace_branch?: string
  codespace_base_branch?: string
  model_api_keys?: {
    model_name: string
    api_key: string
  }[]
  model_name?: string
  starter_kit_repo?: string
  use_enhanced_summary?: boolean
  attachments?: Attachment[]
}

export interface AnalyzeRepositoryResponse {
  task_id: string
  status: string
  message: string
}

export interface RepositoryAnalysisStatusResponse {
  task_id: string
  status: string
  message: string
  progress?: number
}

export interface RepositoryAnalysisResultResponse {
  task_id: string
  status: string
  result: {
    repository: RepositoryInfo
    documents: RepositoryDocument[]
    statistics: RepositoryStatistics
  }
}

export interface RepositoryInfo {
  id: string
  name: string
  full_name: string
  description?: string
  language?: string
  stars: number
  forks: number
  open_issues: number
  default_branch: string
  created_at: string
  updated_at: string
  clone_url: string
  homepage?: string
  owner: {
    login: string
    id: number
    avatar_url: string
  }
}

export interface RepositoryDocument {
  id: string
  filename: string
  path: string
  content: string
  language?: string
  size: number
  type: string
  created_at: string
  updated_at: string
}

export interface RepositoryStatistics {
  total_files: number
  total_lines_of_code: number
  languages: Record<string, number>
  file_types: Record<string, number>
  dependencies: string[]
  complexity_metrics: {
    average_complexity: number
    max_complexity: number
    min_complexity: number
  }
}

export interface RepositoryListResponse {
  repositories: RepositoryInfo[]
  total: number
}

export interface RepositoryDetailsResponse {
  id: string
  repository_url: string
  user_id: string
  created_at: string
  updated_at: string
  analysis_results?: {
    repository: RepositoryInfo
    documents: RepositoryDocument[]
    statistics: RepositoryStatistics
    analyzed_at: string
  }
}

export interface DeleteRepositoryResponse {
  status: string
  message: string
}
