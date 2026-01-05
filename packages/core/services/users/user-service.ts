import { BaseService } from '../base/base-service'
import {
  GetCurrentClerkUserResponse,
  CheckAdminStatusResponse,
} from './user-types'

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

  /**
   * Check if the current authenticated user has admin role
   *
   * GET /users/me/admin
   *
   * @returns Promise resolving to admin status data
   */
  async checkAdminStatus(): Promise<CheckAdminStatusResponse> {
    return this.get<CheckAdminStatusResponse>('/users/me/admin')
  }
}
