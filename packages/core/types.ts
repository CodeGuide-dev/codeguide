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
  key: string
  user_id: string
  name: string
  created_at: string
  expires_at?: string
  is_active: boolean
  metadata?: Record<string, any>
}

// API Response wrapper
export interface ApiKeyListResponse {
  status: string
  data: ApiKey[]
}

export interface CreateApiKeyRequest {
  name: string
}

export interface CreateApiKeyResponse {
  status: string
  data: {
    api_key: string
    id: string
    name: string
    created_at: string
    expires_at?: string
    is_active: boolean
    metadata?: Record<string, any>
  }
  message?: string
}

export interface ApiKeyPermissionResponse {
  success: boolean
  can_create: boolean
  reason?: string
  current_keys_count?: number
  max_keys_allowed?: number
}

export interface ApiKeyResponse {
  status: string
  data: ApiKey
}

export interface RevokeApiKeyResponse {
  status: string
  message: string
  revoked_key_id?: string
}

// Subscription Types
export interface Subscription {
  id: string
  user_id: string
  status:
    | 'active'
    | 'canceled'
    | 'past_due'
    | 'unpaid'
    | 'trialing'
    | 'incomplete'
    | 'incomplete_expired'
  metadata: Record<string, any>
  price_id: string
  quantity: number
  cancel_at_period_end: boolean
  created: string
  current_period_start: string
  current_period_end: string
  ended_at?: string | null
  cancel_at?: string | null
  canceled_at?: string | null
  trial_start?: string | null
  trial_end?: string | null
  org_id?: string | null
}

export interface Product {
  id: string
  active: boolean
  name: string
  description: string | null
  image: string | null
  metadata: Record<string, any>
  marketing_features: string[]
  live_mode: boolean
  is_team_plan: boolean
}

export interface Price {
  id: string
  product_id: string
  active: boolean
  description: string
  unit_amount: number
  currency: string
  type: 'recurring' | 'one_time'
  interval: 'day' | 'week' | 'month' | 'year'
  interval_count: number
  trial_period_days?: number | null
  metadata?: Record<string, any> | null
}

export interface CurrentSubscriptionResponse {
  status: string
  data: {
    subscription: Subscription
    product: Product
    price: Price
  }
}

export interface UserSubscriptionsResponse {
  status: string
  data: Subscription[]
}

export interface SubscriptionProductsResponse {
  status: string
  data: Array<{
    product: Product
    prices: Price[]
  }>
}

export interface CancelSubscriptionRequest {
  cancel_at_period_end: boolean
}

export interface CancelSubscriptionResponse {
  status: string
  message: string
  data: Subscription
}

// Checkout Session Types
export interface CreateCheckoutSessionRequest {
  price_id: string
  success_url: string
  cancel_url: string
}

export interface CreateCheckoutSessionResponse {
  status: string
  checkout_url: string
}

// Cancellation Funnel Types
export interface CancellationFunnelInitiateRequest {
  subscription_id: string
}

export interface CancellationFunnelInitiateResponse {
  status: string
  message: string
  data: {
    funnel_id: string
    subscription_id: string
    current_step: 'initiated'
    created_at: string
    available_offers: string[]
  }
}

export interface CancellationFunnelPauseOfferRequest {
  subscription_id: string
  action: 'accepted' | 'declined'
  pause_duration_months?: number
}

export interface CancellationFunnelPauseOfferResponse {
  status: string
  message: string
  data: {
    funnel_id: string
    subscription_id: string
    pause_offer: {
      action: 'accepted' | 'declined'
      pause_duration_months?: number
      pause_start_date?: string
      pause_end_date?: string
    }
    next_step: string
  }
}

export interface CancellationFunnelSurveyRequest {
  subscription_id: string
  reason: string
  feedback?: string
  competitor_name?: string
}

export interface CancellationFunnelSurveyResponse {
  status: string
  message: string
  data: {
    funnel_id: string
    subscription_id: string
    survey_response: {
      reason: string
      feedback?: string
      competitor_name?: string
      submitted_at: string
    }
    next_step: string
  }
}
