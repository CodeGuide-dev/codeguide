import { BaseService } from '../base/base-service'
import {
  GetDocumentTypesRequest,
  GetDocumentTypesResponse,
  GetChatsByDocumentTypeRequest,
  GetChatsByDocumentTypeResponse,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  ListDocumentChatsRequest,
  ListDocumentChatsResponse,
  GetChatByDocumentIdRequest,
  GetChatByDocumentIdResponse,
} from './chat-types'

export class ChatService extends BaseService {
  /**
   * 1. GET /chat/document/types/{project_id}
   * Get document types for UI grouping
   *
   * @param request - Project ID to get document types for
   * @returns Document types available for the project
   */
  async getDocumentTypes(request: GetDocumentTypesRequest): Promise<GetDocumentTypesResponse> {
    return this.get<GetDocumentTypesResponse>(`/chat/document/types/${request.project_id}`)
  }

  /**
   * 2. GET /chat/document/by-type/{project_id}/{document_type}
   * List all chats for a specific document type (PRIMARY endpoint for UI)
   *
   * @param request - Filter parameters for document type chats
   * @returns Paginated list of document chats for the specified type
   */
  async getChatsByDocumentType(
    request: GetChatsByDocumentTypeRequest
  ): Promise<GetChatsByDocumentTypeResponse> {
    const { project_id, document_type, chat_status = 'active', limit = 50, offset = 0 } = request

    // Build query parameters
    const params = new URLSearchParams()
    if (chat_status) params.append('chat_status', chat_status)
    if (limit !== undefined) params.append('limit', limit.toString())
    if (offset !== undefined) params.append('offset', offset.toString())

    const queryString = params.toString()
    const url = `/chat/document/by-type/${project_id}/${document_type}${queryString ? `?${queryString}` : ''}`

    return this.get<GetChatsByDocumentTypeResponse>(url)
  }

  /**
   * 3. GET /chat/document/history/{conversation_id}
   * Get full chat history with messages
   *
   * @param request - Conversation ID to get history for
   * @returns Conversation details with all messages
   */
  async getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    return this.get<GetChatHistoryResponse>(`/chat/document/history/${request.conversation_id}`)
  }

  /**
   * 4. GET /chat/document/list
   * List all chats for current user (with optional filters)
   *
   * @param request - Filter parameters for listing chats
   * @returns Paginated list of all document chats for the user
   */
  async listDocumentChats(
    request: ListDocumentChatsRequest = {}
  ): Promise<ListDocumentChatsResponse> {
    const {
      project_id,
      document_type,
      template,
      chat_status = 'active',
      limit = 50,
      offset = 0,
    } = request

    // Build query parameters
    const params = new URLSearchParams()
    if (project_id) params.append('project_id', project_id)
    if (document_type) params.append('document_type', document_type)
    if (template) params.append('template', template)
    if (chat_status) params.append('chat_status', chat_status)
    if (limit !== undefined) params.append('limit', limit.toString())
    if (offset !== undefined) params.append('offset', offset.toString())

    const queryString = params.toString()
    const url = `/chat/document/list${queryString ? `?${queryString}` : ''}`

    return this.get<ListDocumentChatsResponse>(url)
  }

  /**
   * 5. GET /chat/document/by-document/{document_id}
   * Get chat by specific document version ID (Legacy)
   *
   * @param request - Document ID to get chat for
   * @returns Conversation and messages for the specific document
   */
  async getChatByDocumentId(
    request: GetChatByDocumentIdRequest
  ): Promise<GetChatByDocumentIdResponse> {
    return this.get<GetChatByDocumentIdResponse>(
      `/chat/document/by-document/${request.document_id}`
    )
  }
}
