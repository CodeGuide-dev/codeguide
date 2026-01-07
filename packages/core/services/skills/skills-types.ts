export interface Skill {
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

export interface CreateSkillRequest {
  name: string
  description: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface UpdateSkillRequest {
  name?: string
  description?: string
  logo_src?: string
  category?: string
  url?: string
  publisher?: string
  ordinal?: number
  metadata?: Record<string, any>
}

export interface ListSkillsRequest {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface SkillResponse {
  status: string
  data: Skill
}

export interface SkillListResponse {
  status: string
  data: Skill[]
  total: number
  limit: number
  offset: number
}
