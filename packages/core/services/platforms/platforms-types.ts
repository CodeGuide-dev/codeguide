export interface PlatformResource {
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

export interface CreatePlatformRequest {
  name: string
  description: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface UpdatePlatformRequest {
  name?: string
  description?: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface ListPlatformsRequest {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface PlatformResponse {
  status: string
  data: PlatformResource
}

export interface PlatformListResponse {
  status: string
  data: PlatformResource[]
  total: number
  limit: number
  offset: number
}
