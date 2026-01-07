export interface MCPServer {
  id: string
  name: string
  description: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface CreateMCPServerRequest {
  name: string
  description: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface UpdateMCPServerRequest {
  name?: string
  description?: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface ListMCPServersRequest {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface MCPServerResponse {
  status: string
  data: MCPServer
}

export interface MCPServerListResponse {
  status: string
  data: MCPServer[]
  total: number
  limit: number
  offset: number
}
