export type Platform = 'github' | 'gitlab' | 'bitbucket'
export type TokenType = 'personal_access_token' | 'deploy_token' | 'github_app' | 'oauth' | 'project_token' | 'group_token' | 'workspace_token' | 'repository_token'

export interface StoreExternalTokenRequest {
  platform: Platform
  token: string
  token_name: string
  token_type: TokenType
  repository_url_pattern?: string
  scopes?: string[]
  expires_at?: string
  metadata?: Record<string, any>
}

export interface StoreExternalTokenResponse {
  id: string
  user_id: string
  platform: Platform
  token_name: string
  token_type: TokenType
  repository_url_pattern?: string
  scopes: string[]
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  token_preview: string
}

export interface StoreWithDetectionRequest {
  token: string
  token_name: string
  repository_url_pattern?: string
  scopes?: string[]
  platform: Platform | null
  expires_at?: string
  metadata?: Record<string, any>
}

export interface StoreWithDetectionResponse extends StoreExternalTokenResponse {}

export interface ListTokensQuery {
  platform?: Platform
  include_inactive?: boolean
  page?: number
  per_page?: number
}

export interface ListTokensResponse {
  tokens: Array<{
    id: string
    platform: Platform
    token_name: string
    token_preview: string
    is_active: boolean
    created_at: string
    last_used_at?: string | null
    expires_at?: string | null
  }>
  total: number
  page: number
  per_page: number
}

export interface ValidateTokenRequest {
  token: string
  platform?: Platform | null
}

export interface TokenUserInfo {
  username: string
  id: number
  name?: string
  email?: string
}

export interface ValidateTokenResponse {
  valid: boolean
  platform: Platform | null
  token_type: TokenType | null
  scopes: string[]
  user_info?: TokenUserInfo
  error_message: string | null
}

export interface FindBestMatchRequest {
  repository_url: string
  required_scopes?: string[]
  preferred_platform?: Platform
}

export interface AlternativeToken {
  id: string
  platform: Platform
  token_name: string
  token_preview: string
  match_reason: string
}

export interface FindBestMatchResponse {
  token_found: boolean
  token?: {
    id: string
    platform: Platform
    token_name: string
    token_preview: string
  }
  match_reason?: string
  alternative_tokens: AlternativeToken[]
}

export interface TestStoredTokenRequest {
  repository_url: string
  operation?: string
}

export interface TestDetails {
  platform: Platform
  token_id: string
  operation: string
  test_timestamp: string
}

export interface TestStoredTokenResponse {
  success: boolean
  message: string
  test_details: TestDetails
  recommendations?: string[]
}

export interface GetTokenResponse extends StoreExternalTokenResponse {}

export interface UpdateTokenRequest {
  token_name?: string
  repository_url_pattern?: string
  scopes?: string[]
  is_active?: boolean
  expires_at?: string
  metadata?: Record<string, any>
}

export interface UpdateTokenResponse extends StoreExternalTokenResponse {}

export interface RevokeTokenResponse {
  success: boolean
  message: string
  revoked_at: string
}

export interface PlatformScopes {
  [key: string]: string[]
}

export interface PlatformInfo {
  name: string
  token_types: TokenType[]
  api_base_url: string
  supported_scopes: PlatformScopes
}

export interface SupportedPlatformsResponse {
  platforms: {
    github: PlatformInfo
    gitlab: PlatformInfo
    bitbucket: PlatformInfo
  }
  total_count: number
  features: string[]
}

// Platform-specific store requests for backward compatibility
export interface StoreGitHubTokenRequest {
  token: string
  token_name: string
  repository_url_pattern?: string
  scopes?: string[]
  expires_at?: string
  metadata?: Record<string, any>
}

export interface StoreGitLabTokenRequest {
  token: string
  token_name: string
  repository_url_pattern?: string
  scopes?: string[]
  expires_at?: string
  metadata?: Record<string, any>
}