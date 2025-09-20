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
