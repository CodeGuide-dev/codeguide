
export interface ProjectRepository {
  id: string
  name: string
  repo_url: string
  branch: string
  project_id: string
  user_id: string
  files_processed: number
  total_characters: number
  total_lines: number
  total_files_found: number
  total_directories: number
  author: string
  estimated_tokens: number
  estimated_size_bytes: number
  tree_structure?: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: string
  category_id: string
  starter_kit_id?: string
  ai_questionaire?: {
    experience_level?: string
    timeline?: string
    team_size?: number
  }
  tools_selected?: string[]
  project_outline?: {
    features?: string[]
    architecture?: string
  }
  codie_tool_id?: string
  existing_project_repo_url?: string | null
  created_at: string
  updated_at: string
  user_id: string
  project_documents: ProjectDocument[]
  category?: Category
  starter_kit?: StarterKitReference
  codie_tool?: CodieTool
  project_repositories: ProjectRepository[]
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
  description: string
}

export interface CodieTool {
  id: string
  name: string
  description: string
  type: string
  api_endpoint?: string
  created_at?: string
  updated_at?: string
}

export interface StarterKitReference {
  id: string
  name: string
  description: string
}

export interface CreateProjectRequest {
  title?: string // Optional - will be auto-generated if not provided
  description: string
  status?: 'prompt' | 'draft' | 'in_progress' | 'completed'
  category_id?: string
  starter_kit_id?: string
  ai_questionaire?: {
    experience_level?: string
    timeline?: string
    team_size?: number
  }
  tools_selected?: string[]
  project_outline?: {
    features?: string[]
    architecture?: string
  }
  codie_tool_id?: string
  existing_project_repo_url?: string
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  status?: string
  category_id?: string
  starter_kit_id?: string
  ai_questionaire?: {
    experience_level?: string
    timeline?: string
    team_size?: number
  }
  tools_selected?: string[]
  project_outline?: {
    features?: string[]
    architecture?: string
  }
  codie_tool_id?: string
  existing_project_repo_url?: string
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
  count: number
  page: number
  page_size: number
  total_pages: number
}

export interface ConnectRepositoryRequest {
  repo_url: string
  branch: string
  github_token?: string
}

export interface ConnectRepositoryResponse {
  status: string
  data: ProjectRepository
}

