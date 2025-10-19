import { BaseService } from '../base/base-service'
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListResponse,
  ProjectResponse,
  PaginatedProjectsRequest,
  PaginatedProjectsResponse,
  GetProjectsRequest,
  GetProjectDocumentsRequest,
  GetProjectDocumentsResponse,
  ConnectRepositoryRequest,
  ConnectRepositoryResponse,
} from './project-types'

export class ProjectService extends BaseService {
  async getAllProjects(params?: GetProjectsRequest): Promise<Project[]> {
    const queryParams = new URLSearchParams()

    if (params?.has_repository !== undefined) {
      queryParams.append('has_repository', params.has_repository.toString())
    }

    const url = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.get<ProjectListResponse>(url)
    return response.data
  }

  async getPaginatedProjects(params: PaginatedProjectsRequest): Promise<PaginatedProjectsResponse> {
    const queryParams = new URLSearchParams()

    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString())
    if (params.search_query) queryParams.append('search_query', params.search_query)
    if (params.status) queryParams.append('status', params.status)
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.sort_by_date) queryParams.append('sort_by_date', params.sort_by_date)
    if (params.has_repository !== undefined) queryParams.append('has_repository', params.has_repository.toString())

    const url = `/projects/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<PaginatedProjectsResponse>(url)
  }

  async getProjectById(projectId: string): Promise<Project> {
    const response = await this.get<ProjectResponse>(`/projects/${projectId}`)
    return response.data
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    const response = await this.post<ProjectResponse>('/projects', request)
    return response.data
  }

  async updateProject(projectId: string, request: UpdateProjectRequest): Promise<Project> {
    const response = await this.put<ProjectResponse>(`/projects/${projectId}`, request)
    return response.data
  }

  async deleteProject(projectId: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/projects/${projectId}`)
  }

  async getProjectDocuments(
    projectId: string,
    params?: GetProjectDocumentsRequest
  ): Promise<GetProjectDocumentsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.current_version_only !== undefined) {
      queryParams.append('current_version_only', params.current_version_only.toString())
    }

    const url = `/projects/${projectId}/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<GetProjectDocumentsResponse>(url)
  }

  async connectRepository(
    projectId: string,
    request: ConnectRepositoryRequest
  ): Promise<ConnectRepositoryResponse> {
    this.validateConnectRepositoryRequest(request)
    const response = await this.post<ConnectRepositoryResponse>(`/projects/${projectId}/repository`, request)
    return response
  }

  private validateConnectRepositoryRequest(request: ConnectRepositoryRequest): void {
    if (!request.repo_url) {
      throw new Error('Repository URL is required')
    }

    if (!request.branch) {
      throw new Error('Branch name is required')
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/
    if (!githubUrlPattern.test(request.repo_url)) {
      throw new Error('Repository URL must be a valid GitHub URL (e.g., https://github.com/user/repo)')
    }

    // Validate branch name format (basic validation)
    if (!/^[a-zA-Z0-9._-]+$/.test(request.branch)) {
      throw new Error('Branch name contains invalid characters')
    }

    // Validate GitHub token format if provided
    if (request.github_token && !request.github_token.startsWith('ghp_') && !request.github_token.startsWith('gho_') && !request.github_token.startsWith('ghu_') && !request.github_token.startsWith('ghs_') && !request.github_token.startsWith('ghr_')) {
      throw new Error('GitHub token must be a valid personal access token')
    }
  }
}
