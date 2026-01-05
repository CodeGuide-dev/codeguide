/**
 * Data Management Service Types
 *
 * Provides interfaces for viewing data statistics and bulk deleting user data
 */

/**
 * Response structure for GET /data/stats endpoint
 * Contains aggregate counts of all user data across the platform
 */
export interface DataStatsResponse {
  status: string
  data: DataStats
}

/**
 * Aggregate statistics for all user data entities
 */
export interface DataStats {
  projects: number
  project_documents: number
  project_repositories: number
  project_tasks: number
  task_groups: number
  chat_conversations: number
  chat_messages: number
  codespace_tasks: number
}

/**
 * Request structure for DELETE /data/all endpoint
 * Requires explicit confirmation to prevent accidental data loss
 */
export interface DeleteAllDataRequest {
  confirm: boolean
}

/**
 * Response structure for DELETE /data/all endpoint
 * Provides summary of deleted data counts
 */
export interface DeleteAllDataResponse {
  status: string
  message: string
  deleted: DataStats
}

/**
 * Response structure for GET /data/export endpoint
 * Contains complete export of all user data
 */
export interface DataExportResponse {
  status: string
  exported_at: string
  user_id: string
  data: ExportedData
}

/**
 * Complete exported data containing all user entities
 */
export interface ExportedData {
  projects: ExportedProject[]
  project_documents: ExportedProjectDocument[]
  project_repositories: ExportedProjectRepository[]
  project_tasks: ExportedProjectTask[]
  task_groups: ExportedTaskGroup[]
  chat_conversations: ExportedChatConversation[]
  chat_messages: ExportedChatMessage[]
  codespace_tasks: ExportedCodespaceTask[]
}

/**
 * Exported project entity
 */
export interface ExportedProject {
  id: string
  title: string
  description: string
  status: string
  user_id: string
  created_at: string
  updated_at: string
  project_outline?: Record<string, any>
  ai_questionaire?: Record<string, any>
}

/**
 * Exported project document entity
 */
export interface ExportedProjectDocument {
  id: string
  project_id: string
  content: string
  custom_document_type: string
  is_current_version: boolean
  created_at: string
}

/**
 * Exported project repository entity
 */
export interface ExportedProjectRepository {
  id: string
  project_id: string
  repo_url: string
  created_at: string
}

/**
 * Exported project task entity
 */
export interface ExportedProjectTask {
  id: string
  project_id: string
  title: string
  status: string
  priority: string
  created_at: string
}

/**
 * Exported task group entity
 */
export interface ExportedTaskGroup {
  id: string
  project_id: string
  name: string
  created_at: string
}

/**
 * Exported chat conversation entity
 */
export interface ExportedChatConversation {
  id: string
  title: string
  model: string
  created_at: string
  last_message_at: string
}

/**
 * Exported chat message entity
 */
export interface ExportedChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  token_count: number
  created_at: string
}

/**
 * Exported codespace task entity
 */
export interface ExportedCodespaceTask {
  id: string
  project_id: string
  status: string
  created_at: string
}
