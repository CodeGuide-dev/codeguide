import { BaseService } from '../base/base-service'
import {
  Skill,
  CreateSkillRequest,
  UpdateSkillRequest,
  ListSkillsRequest,
  SkillResponse,
  SkillListResponse,
} from './skills-types'

export class SkillsService extends BaseService {
  async listSkills(params?: ListSkillsRequest): Promise<SkillListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

    const url = `/skills/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<SkillListResponse>(url)
  }

  async getSkill(id: string): Promise<SkillResponse> {
    return this.get<SkillResponse>(`/skills/${id}`)
  }

  async createSkill(request: CreateSkillRequest): Promise<SkillResponse> {
    return this.post<SkillResponse>('/skills/', request)
  }

  async updateSkill(id: string, request: UpdateSkillRequest): Promise<SkillResponse> {
    return this.put<SkillResponse>(`/skills/${id}`, request)
  }

  async deleteSkill(id: string): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>(`/skills/${id}`)
  }
}
