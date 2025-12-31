// ============================================================================
// Document Chat GET Endpoint Types
// ============================================================================

// ============================================================================
// 1. GET /chat/document/types/{project_id}
// Get document types for UI grouping
// ============================================================================

export interface GetDocumentTypesRequest {
  project_id: string
}

export interface GetDocumentTypesResponse {
  project_id: string
  project_name: string
  document_types: DocumentType[]
}

export type DocumentType =
  | 'project_requirements_document'
  | 'app_flow_document'
  | 'tech_stack_document'
  | 'frontend_guidelines_document'
  | 'database_schema_document'
  | 'api_documentation_document'
  | 'deployment_document'
  | 'testing_document'
  | 'custom_document'

// ============================================================================
// 2. GET /chat/document/by-type/{project_id}/{document_type}
// List all chats for a specific document type (PRIMARY endpoint for UI)
// ============================================================================

export interface GetChatsByDocumentTypeRequest {
  project_id: string
  document_type: DocumentType
  chat_status?: ChatStatus
  limit?: number
  offset?: number
}

export interface GetChatsByDocumentTypeResponse {
  chats: DocumentChatSummary[]
  count: number
  project_id: string
  document_type: DocumentType
  limit: number
  offset: number
}

// ============================================================================
// 3. GET /chat/document/history/{conversation_id}
// Get full chat history with messages
// ============================================================================

export interface GetChatHistoryRequest {
  conversation_id: string
}

export interface GetChatHistoryResponse {
  conversation: DocumentConversation
  messages: ChatMessage[]
}

// ============================================================================
// 4. GET /chat/document/list
// List all chats for current user (with optional filters)
// ============================================================================

export interface ListDocumentChatsRequest {
  project_id?: string
  document_type?: DocumentType
  template?: 'blueprint' | 'wireframe'
  chat_status?: ChatStatus
  limit?: number
  offset?: number
}

export interface ListDocumentChatsResponse {
  chats: DocumentChatSummary[]
  count: number
  limit: number
  offset: number
}

// ============================================================================
// 5. GET /chat/document/by-document/{document_id}
// Get chat by specific document version ID (Legacy)
// ============================================================================

export interface GetChatByDocumentIdRequest {
  document_id: string
}

export interface GetChatByDocumentIdResponse {
  conversation: DocumentConversation
  messages: ChatMessage[]
}

// ============================================================================
// Common Types
// ============================================================================

export type ChatStatus = 'active' | 'archived' | 'deleted'

export interface DocumentChatSummary {
  id: string
  project_id: string
  document_type: DocumentType
  title: string
  template: 'blueprint' | 'wireframe'
  status: ChatStatus
  last_message_at: string
  metadata?: Record<string, any>
}

export interface DocumentConversation {
  id: string
  project_id: string
  document_type: DocumentType
  title: string
  template: 'blueprint' | 'wireframe'
  status: ChatStatus
  created_at: string
  last_message_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tool_calls?: ChatToolCall[]
  created_at: string
}

export interface ChatToolCall {
  id: string
  type: string
  function?: {
    name: string
    arguments: string
  }
}
