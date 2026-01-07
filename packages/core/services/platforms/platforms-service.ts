import { BaseService } from '../base/base-service'
import {
  PlatformResource,
  CreatePlatformRequest,
  UpdatePlatformRequest,
  ListPlatformsRequest,
  PlatformResponse,
  PlatformListResponse,
} from './platforms-types'

export class PlatformsService extends BaseService {
  async listPlatforms(params?: ListPlatformsRequest): Promise<PlatformListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

    const url = `/platforms/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<PlatformListResponse>(url)
  }

  async getPlatform(id: string): Promise<PlatformResponse> {
    return this.get<PlatformResponse>(`/platforms/${id}`)
  }

  async createPlatform(request: CreatePlatformRequest): Promise<PlatformResponse> {
    return this.post<PlatformResponse>('/platforms/', request)
  }

  async updatePlatform(id: string, request: UpdatePlatformRequest): Promise<PlatformResponse> {
    return this.put<PlatformResponse>(`/platforms/${id}`, request)
  }

  async deletePlatform(id: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/platforms/${id}`)
  }
}
