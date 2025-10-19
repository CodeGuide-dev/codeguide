export interface ProjectRepository {
  id: string
  project_id: string
  repo_url: string
  branch: string
  author: string
  name: string
  connection_status: 'pending' | 'connected' | 'failed'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
  project_documents: ProjectDocument[]
  project_repositories: ProjectRepository[]
  category?: Category
  codie_tool?: CodieTool
  github_url?: string
  status?: string
  tools_selected?: string[]
  ai_questionaire?: Record<string, any>
  project_outline?: Record<string, any>
}

export interface ProjectDocument {
  id: string
  created_at: string
  updated_at: string | null
  project_id: string
  user_id: string
  title: string
  document_type: string
  description: string | null
  content: string
  custom_document_type: string
  last_action: string
  is_current_version: boolean
  status: string
}

export interface GetProjectDocumentsRequest {
  current_version_only?: boolean
}

export interface GetProjectDocumentsResponse {
  status: string
  data: ProjectDocument[]
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface CodieTool {
  id: string
  name: string
  description?: string
  category?: string
}

export interface CreateProjectRequest {
  title: string
  description: string
  category_id?: string
  codie_tool_id?: string
  tools_selected?: string[]
  ai_questionaire?: Record<string, any>
  project_outline?: Record<string, any>
  github_url?: string
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  category_id?: string
  codie_tool_id?: string
  tools_selected?: string[]
  ai_questionaire?: Record<string, any>
  project_outline?: Record<string, any>
  github_url?: string
  status?: string
}

export interface ProjectListResponse {
  status: string
  data: Project[]
}

export interface ProjectResponse {
  status: string
  data: Project
}

export interface GetProjectsRequest {
  has_repository?: boolean
}

export interface PaginatedProjectsRequest {
  page?: number
  page_size?: number
  search_query?: string
  status?: string
  start_date?: string
  end_date?: string
  sort_by_date?: 'asc' | 'desc'
  has_repository?: boolean
}

export interface PaginatedProjectsResponse {
  status: string
  data: Project[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface ConnectRepositoryRequest {
  repo_url: string
  branch: string
  github_token?: string
}

export interface ConnectRepositoryResponse {
  status: string
  data: {
    id: string
    project_id: string
    repo_url: string
    branch: string
    connection_status: 'pending' | 'connected' | 'failed'
    created_at: string
    updated_at: string
  }
}
