export interface CodeGuideRequest {
  prompt: string
  language?: string
  context?: string
}

export interface CodeGuideResponse {
  id?: string
  response?: string
  refined_prompt?: string
  content?: string
  timestamp: string
  language?: string
}

export interface APIServiceConfig {
  baseUrl: string
  // Database API Key (highest priority) - format: sk_...
  databaseApiKey?: string
  // Legacy API Key (medium priority)
  apiKey?: string
  // Legacy User ID (for legacy auth)
  userId?: string
  // Clerk JWT Token (lowest priority)
  jwtToken?: string
  timeout?: number
}

export interface AuthenticationMethod {
  type: 'database-api-key' | 'legacy-api-key' | 'clerk-jwt'
  priority: number
  headers: Record<string, string>
}

export interface AuthenticationResult {
  success: boolean
  method?: AuthenticationMethod
  user?: {
    id: string
    email?: string
    subscriptionStatus?: string
    creditsRemaining?: number
  }
  error?: string
}

export interface CodeGuideOptions {
  language?: string
  context?: string
  verbose?: boolean
}

// API Key Enhanced Types
export interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used?: string
  is_active: boolean
  usage_count?: number
}

export interface CreateApiKeyRequest {
  name: string
}

export interface CreateApiKeyResponse {
  api_key: string
  id: string
  name: string
  prefix: string
  created_at: string
  message: string
}

export interface ApiKeyPermission {
  can_create: boolean
  reason?: string
  current_keys_count?: number
  max_keys_allowed?: number
}

export interface RevokeApiKeyResponse {
  message: string
  revoked_key_id: string
}
