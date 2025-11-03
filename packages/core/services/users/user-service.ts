import { BaseService } from '../base/base-service'
import { GetCurrentClerkUserResponse } from './user-types'

export class UserService extends BaseService {
  /**
   * Get the current Clerk user information
   *
   * GET /users/me/clerk
   *
   * @returns Promise resolving to the current Clerk user data
   */
  async getCurrentClerkUser(): Promise<GetCurrentClerkUserResponse> {
    return this.get<GetCurrentClerkUserResponse>('/users/me/clerk')
  }
}
