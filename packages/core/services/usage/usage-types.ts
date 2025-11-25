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

export interface CreditBalanceData {
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

export interface CreditBalanceResponse {
  data: CreditBalanceData
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

export interface CreditBalance {
  total_allotted: number
  total_consumed: number
  remaining_credits: number
  is_over_limit: boolean
  utilization_percentage: number
  billing_cycle_start: string
  billing_cycle_end: string
}

export interface LimitInfo {
  allowed?: boolean
  current_usage?: number
  limit: number
  remaining?: number
  period_type?: string
  period_start?: string | null
  period_end?: string | null
  message?: string
  is_unlimited: boolean
  period?: string
  description?: string
}

export interface PlanLimits {
  plan_type: string
  limits: {
    codespace_tasks: LimitInfo
    api_calls: LimitInfo
    storage_gb: LimitInfo
    projects: LimitInfo
    collaborators: LimitInfo
  }
}

export interface AuthorizationSubscription {
  id: string
  status: string
  interval: string
  current_period_start: string
  current_period_end: string
  price_id: string
  product_name: string | null
  plan_name: string
}

export interface AuthorizationData {
  user_id: string
  subscription: AuthorizationSubscription | null
  credit_balance: CreditBalance
  has_active_subscription: boolean
  has_previous_subscriptions: boolean
  is_within_credit_limit: boolean
  authorization_level: string
  restrictions: string[]
  can_create_tasks: boolean
  can_analyze_repos: boolean
  can_access_previous_projects: boolean
  plan_limits: PlanLimits
  codespace_task_limit: LimitInfo | null
}

export interface AuthorizationResponse {
  success: boolean
  data: AuthorizationData
  message: string
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

export interface CodespaceTaskUsageData {
  total_records: number
  total_credits_consumed: number
  latest_usage: string
}

export interface CodespaceTaskUsageResponse {
  status: string
  data: CodespaceTaskUsageData
}

export interface HealthResponse {
  status: string
  timestamp: string
  version: string
}

// Dashboard Analytics Types
export type PeriodType = '7d' | '1w' | '1m' | '3m'
export type ServiceType = 'docs' | 'chat' | 'codespace_task' | 'api'
export type SortOrder = 'asc' | 'desc'
export type SortByField = 'created_at' | 'credits_consumed' | 'cost_amount'

export interface DashboardAnalyticsRequest {
  period?: PeriodType
  start_date?: string
  end_date?: string
  service_type?: ServiceType
}

export interface DailyUsage {
  date: string
  credits_consumed: number
  cost_usd: number
  requests_count: number
  average_credits_per_request: number
}

export interface ServiceUsage {
  service_type: ServiceType
  credits_consumed: number
  requests_count: number
}

export interface AnalyticsTotals {
  credits_consumed: number
  cost_usd: number
  requests_count: number
}

export interface AnalyticsAverages {
  daily_credits: number
  daily_requests: number
}

export interface AnalyticsTrends {
  credits_consumed: number
  requests_count: number
}

export interface PeriodInfo {
  start: string
  end: string
  label: string
}

export interface DashboardAnalyticsResponse {
  status: string
  data: {
    period: PeriodInfo
    daily_usage: DailyUsage[]
    totals: AnalyticsTotals
    averages: AnalyticsAverages
    trends: AnalyticsTrends
    top_services: ServiceUsage[]
  }
}

// Usage Details Types
export interface UsageDetailsRequest {
  period?: PeriodType
  start_date?: string
  end_date?: string
  service_type?: ServiceType
  page?: number
  page_size?: number
  sort_by?: SortByField
  sort_order?: SortOrder
}

export interface UsageDetailRecord {
  id: string
  created_at: string
  service_type: ServiceType
  model_name: string
  usage_type: string
  units_consumed: number
  credits_consumed: number
  cost_amount: number | null
}

export interface UsageDetailsPagination {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface UsageDetailsFilters {
  period: string | null
  start_date: string | null
  end_date: string | null
  service_type: string | null
}

export interface UsageDetailsResponse {
  status: string
  data: UsageDetailRecord[]
  pagination: UsageDetailsPagination
  filters: UsageDetailsFilters
}

// Usage Summary Types
export interface UsageSummaryRequest {
  period?: PeriodType
  start_date?: string
  end_date?: string
}

export interface CurrentPeriodUsage {
  credits_consumed: number
  cost_usd: number
  requests_count: number
}

export interface PreviousPeriodUsage {
  credits_consumed: number
  cost_usd: number
  requests_count: number
}

export interface BillingCycleInfo {
  total_allotted: number
  total_consumed: number
  remaining_credits: number
}

export interface UsageSummaryResponse {
  status: string
  data: {
    current_period: CurrentPeriodUsage
    previous_period: PreviousPeriodUsage
    billing_cycle: BillingCycleInfo
    utilization_percentage: number
    remaining_credits: number
    daily_average: number
    projected_monthly: number
  }
}

// Service Breakdown Types
export interface ServiceBreakdownRequest {
  period?: PeriodType
  start_date?: string
  end_date?: string
}

export interface ServiceBreakdown {
  service_type: ServiceType
  credits_consumed: number
  percentage: number
  cost_usd: number
  requests_count: number
  trend: number
}

export interface ServiceBreakdownData {
  period: PeriodInfo
  services: ServiceBreakdown[]
  total_credits: number
  total_cost: number
}

export interface ServiceBreakdownResponse {
  status: string
  data: ServiceBreakdownData
}
