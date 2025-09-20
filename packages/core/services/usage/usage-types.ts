export interface TrackUsageRequest {
  model_key: string
  input_tokens: number
  output_tokens: number
  call_seconds?: number
  cost_amount?: number
}

export interface TrackUsageResponse {
  success: boolean
  credits_used: number
  remaining_credits: number
  message: string
}

export interface CreditBalanceResponse {
  user_id: string
  total_consumed: number
  total_allotted: number
  remaining_credits: number
  utilization_percentage: number
  billing_cycle_start: string
  billing_cycle_end: string
  subscription: {
    plan: string
    status: string
  }
}

export interface CreditCheckRequest {
  model_key: string
  input_tokens?: number
  output_tokens?: number
  call_seconds?: number
}

export interface CreditCheckResponse {
  has_sufficient_credits: boolean
  estimated_cost: number
  remaining_credits: number
  model_key: string
}

export interface UsageSummaryRequest {
  start_date?: string
  end_date?: string
}

export interface UsageSummaryResponse {
  user_id: string
  period: {
    start_date: string
    end_date: string
  }
  usage_summary: {
    total_credits_used: number
    total_calls: number
    model_breakdown: Record<string, any>
    daily_usage: Array<{
      date: string
      credits_used: number
      calls: number
    }>
  }
  subscription: {
    plan: string
    status: string
  }
}

export interface AuthorizationResponse {
  user_id: string
  subscription: {
    plan: string
    status: string
    features: string[]
  }
  usage_limits: {
    monthly_credits: number
    max_calls_per_day: number
  }
  permissions: string[]
}

export interface FreeUserStatusResponse {
  is_free_user: boolean
  has_available_credits: boolean
  credits_remaining: number
  credits_expire_at?: string
}

export interface CalculateUsageRequest {
  model_key: string
  input_tokens?: number
  output_tokens?: number
  call_seconds?: number
  cost_amount?: number
}

export interface CalculateUsageResponse {
  model_key: string
  estimated_cost: number
  calculation_breakdown: {
    input_cost: number
    output_cost: number
    time_cost: number
    total_cost: number
  }
}

export interface TrackCodespaceUsageRequest {
  codespace_task_id: string
  model_key: string
  input_tokens: number
  output_tokens: number
  call_seconds?: number
  cost_amount?: number
}

export interface TrackCodespaceUsageResponse {
  id: string
  codespace_task_id: string
  user_id: string
  model_key: string
  input_tokens: number
  output_tokens: number
  call_seconds: number
  cost_amount: number
  created_at: string
}

export interface CodespaceTaskUsageResponse {
  codespace_task_id: string
  total_usage: {
    total_input_tokens: number
    total_output_tokens: number
    total_call_seconds: number
    total_cost: number
  }
  usage_records: TrackCodespaceUsageResponse[]
}

export interface HealthResponse {
  status: string
  timestamp: string
  version: string
}
