import { BaseService } from '../base/base-service'
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListResponse,
  ProjectResponse,
  PaginatedProjectsRequest,
  PaginatedProjectsResponse,
  GetProjectDocumentsRequest,
  GetProjectDocumentsResponse,
} from './project-types'

export class ProjectService extends BaseService {
  async getAllProjects(): Promise<Project[]> {
    const response = await this.get<ProjectListResponse>('/projects')
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
}
