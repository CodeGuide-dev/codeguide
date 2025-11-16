import { BaseService } from '../base/base-service'
import {
  StarterKit,
  GetStarterKitsRequest,
  GetStarterKitsResponse,
} from './starter-kits-types'

export class StarterKitsService extends BaseService {
  /**
   * Get starter kits with optional filtering
   *
   * GET /starter-kits/
   *
   * @param params Optional query parameters for filtering
   * @returns Promise resolving to an array of starter kits
   */
  async getStarterKits(params?: GetStarterKitsRequest): Promise<StarterKit[]> {
    const queryParams = new URLSearchParams()

    if (params?.name) {
      queryParams.append('name', params.name)
    }

    if (params?.repo_name) {
      queryParams.append('repo_name', params.repo_name)
    }

    const url = `/starter-kits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.get<GetStarterKitsResponse>(url)
    return response.data
  }
}

