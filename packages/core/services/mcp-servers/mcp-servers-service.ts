import { BaseService } from '../base/base-service'
import {
  MCPServer,
  CreateMCPServerRequest,
  UpdateMCPServerRequest,
  ListMCPServersRequest,
  MCPServerResponse,
  MCPServerListResponse,
} from './mcp-servers-types'

export class MCPServersService extends BaseService {
  async listMCPServers(params?: ListMCPServersRequest): Promise<MCPServerListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

    const url = `/mcp-servers/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<MCPServerListResponse>(url)
  }

  async getMCPServer(id: string): Promise<MCPServerResponse> {
    return this.get<MCPServerResponse>(`/mcp-servers/${id}`)
  }

  async createMCPServer(request: CreateMCPServerRequest): Promise<MCPServerResponse> {
    return this.post<MCPServerResponse>('/mcp-servers/', request)
  }

  async updateMCPServer(id: string, request: UpdateMCPServerRequest): Promise<MCPServerResponse> {
    return this.put<MCPServerResponse>(`/mcp-servers/${id}`, request)
  }

  async deleteMCPServer(id: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/mcp-servers/${id}`)
  }
}
