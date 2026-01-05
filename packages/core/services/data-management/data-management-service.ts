import { BaseService } from '../base/base-service'
import {
  DataStatsResponse,
  DeleteAllDataRequest,
  DeleteAllDataResponse,
  DataExportResponse,
} from './data-management-types'

export class DataManagementService extends BaseService {
  /**
   * Get comprehensive statistics of all user data
   *
   * Calls GET /data/stats to retrieve aggregate counts of:
   * - Projects
   * - Project documents
   * - Project repositories
   * - Project tasks
   * - Task groups
   * - Chat conversations
   * - Chat messages
   * - Codespace tasks
   *
   * @returns Promise resolving to DataStatsResponse with counts for each entity type
   */
  async getDataStats(): Promise<DataStatsResponse> {
    return this.get<DataStatsResponse>('/data/stats')
  }

  /**
   * Export all user data
   *
   * Calls GET /data/export to retrieve complete export of all user data.
   * This includes all projects, documents, repositories, tasks, conversations,
   * messages, and codespace tasks with their full details.
   *
   * Use this for:
   * - Creating backups
   * - Migrating data to another system
   * - Data analysis
   * - Compliance and auditing
   *
   * @returns Promise resolving to DataExportResponse with complete user data
   */
  async exportData(): Promise<DataExportResponse> {
    return this.get<DataExportResponse>('/data/export')
  }

  /**
   * Delete all user data with explicit confirmation
   *
   * Calls DELETE /data/all to perform bulk deletion of all user data.
   * This operation requires confirmation to prevent accidental data loss.
   *
   * The deletion will affect:
   * - All projects (including documents and repositories)
   * - All task groups and project tasks
   * - All chat conversations and messages
   * - All codespace tasks
   *
   * @param request - DeleteAllDataRequest with confirm flag set to true
   * @returns Promise resolving to DeleteAllDataResponse with deletion summary
   * @throws Error if confirmation is not true
   */
  async deleteAllData(request: DeleteAllDataRequest): Promise<DeleteAllDataResponse> {
    // Validate confirmation flag to prevent accidental deletion
    if (!request.confirm) {
      throw new Error(
        'Confirmation required. Set confirm: true to delete all data. This action cannot be undone.'
      )
    }

    return this.delete<DeleteAllDataResponse>('/data/all')
  }
}
