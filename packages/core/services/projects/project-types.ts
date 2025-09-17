export interface Project {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  project_documents: ProjectDocument[];
  category?: Category;
  codie_tool?: CodieTool;
  github_url?: string;
  status?: string;
  tools_selected?: string[];
  ai_questionaire?: Record<string, any>;
  project_outline?: Record<string, any>;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CodieTool {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  category_id?: string;
  codie_tool_id?: string;
  tools_selected?: string[];
  ai_questionaire?: Record<string, any>;
  project_outline?: Record<string, any>;
  github_url?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  category_id?: string;
  codie_tool_id?: string;
  tools_selected?: string[];
  ai_questionaire?: Record<string, any>;
  project_outline?: Record<string, any>;
  github_url?: string;
  status?: string;
}

export interface ProjectListResponse {
  status: string;
  data: Project[];
}

export interface ProjectResponse {
  status: string;
  data: Project;
}

export interface PaginatedProjectsRequest {
  page?: number;
  page_size?: number;
  search_query?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sort_by_date?: 'asc' | 'desc';
}

export interface PaginatedProjectsResponse {
  status: string;
  data: Project[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}
