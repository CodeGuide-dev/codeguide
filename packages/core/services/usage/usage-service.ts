import { BaseService } from '../base/base-service'
import {
  TrackUsageRequest,
  TrackUsageResponse,
  CreditBalanceResponse,
  CreditCheckRequest,
  CreditCheckResponse,
  UsageSummaryRequest,
  UsageSummaryResponse,
  AuthorizationResponse,
  FreeUserStatusResponse,
  CalculateUsageRequest,
  CalculateUsageResponse,
  TrackCodespaceUsageRequest,
  TrackCodespaceUsageResponse,
  CodespaceTaskUsageResponse,
  HealthResponse,
  DashboardAnalyticsRequest,
  DashboardAnalyticsResponse,
  UsageDetailsRequest,
  UsageDetailsResponse,
  ServiceBreakdownRequest,
  ServiceBreakdownResponse,
  // Activity Heatmap types
  ActivityHeatmapRequest,
  ActivityHeatmapResponse,
  // Repository Analysis types
  RepositoryAnalysisSummaryRequest,
  RepositoryAnalysisSummaryResponse,
  RepositoryAnalysisTimelineRequest,
  RepositoryAnalysisTimelineResponse,
} from './usage-types'

export class UsageService extends BaseService {
  async trackUsage(request: TrackUsageRequest): Promise<TrackUsageResponse> {
    return this.post<TrackUsageResponse>('/usage/track', request)
  }

  async getCreditBalance(): Promise<CreditBalanceResponse> {
    return this.get<CreditBalanceResponse>('/usage/credit-balance')
  }

  async checkCredits(params: CreditCheckRequest): Promise<CreditCheckResponse> {
    const queryParams = new URLSearchParams()

    queryParams.append('model_key', params.model_key)
    if (params.input_tokens !== undefined)
      queryParams.append('input_tokens', params.input_tokens.toString())
    if (params.output_tokens !== undefined)
      queryParams.append('output_tokens', params.output_tokens.toString())
    if (params.call_seconds !== undefined)
      queryParams.append('call_seconds', params.call_seconds.toString())

    const url = `/usage/credit-check?${queryParams.toString()}`
    return this.get<CreditCheckResponse>(url)
  }

  
  async getAuthorization(): Promise<AuthorizationResponse> {
    return this.get<AuthorizationResponse>('/usage/authorization')
  }

  async getFreeUserStatus(): Promise<FreeUserStatusResponse> {
    return this.get<FreeUserStatusResponse>('/usage/free-user-status')
  }

  async calculateUsageCost(params: CalculateUsageRequest): Promise<CalculateUsageResponse> {
    const queryParams = new URLSearchParams()

    queryParams.append('model_key', params.model_key)
    if (params.input_tokens !== undefined)
      queryParams.append('input_tokens', params.input_tokens.toString())
    if (params.output_tokens !== undefined)
      queryParams.append('output_tokens', params.output_tokens.toString())
    if (params.call_seconds !== undefined)
      queryParams.append('call_seconds', params.call_seconds.toString())
    if (params.cost_amount !== undefined)
      queryParams.append('cost_amount', params.cost_amount.toString())

    const url = `/usage/calculate?${queryParams.toString()}`
    return this.get<CalculateUsageResponse>(url)
  }

  async trackCodespaceUsage(
    request: TrackCodespaceUsageRequest
  ): Promise<TrackCodespaceUsageResponse> {
    return this.post<TrackCodespaceUsageResponse>('/usage/codespace/track', request)
  }

  async getCodespaceTaskUsage(codespaceTaskId: string): Promise<CodespaceTaskUsageResponse> {
    return this.get<CodespaceTaskUsageResponse>(`/usage/codespace/task/${codespaceTaskId}`)
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<HealthResponse>('/usage/health')
      return response.status === 'healthy'
    } catch {
      return false
    }
  }

  // Dashboard Analytics Methods
  async getDashboardAnalytics(params?: DashboardAnalyticsRequest): Promise<DashboardAnalyticsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.service_type) queryParams.append('service_type', params.service_type)

    const url = `/usage/dashboard/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<DashboardAnalyticsResponse>(url)
  }

  async getUsageDetails(params?: UsageDetailsRequest): Promise<UsageDetailsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.service_type) queryParams.append('service_type', params.service_type)
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.page_size !== undefined) queryParams.append('page_size', params.page_size.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

    const url = `/usage/dashboard/details${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<UsageDetailsResponse>(url)
  }

  async getUsageSummary(params?: UsageSummaryRequest): Promise<UsageSummaryResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const url = `/usage/dashboard/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<UsageSummaryResponse>(url)
  }

  async getServiceBreakdown(params?: ServiceBreakdownRequest): Promise<ServiceBreakdownResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const url = `/usage/dashboard/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<ServiceBreakdownResponse>(url)
  }

  // Activity Heatmap Methods

  /**
   * Get activity heatmap data based on codespace tasks created.
   * Similar to GitHub's contribution graph.
   *
   * @param params - Optional request parameters
   * @param params.period - Time period: '3m', '6m', '1y' (default: '3m')
   * @param params.start_date - Custom start date in YYYY-MM-DD format
   * @param params.end_date - Custom end date in YYYY-MM-DD format
   * @returns Activity heatmap data with daily counts and levels
   */
  async getActivityHeatmap(params?: ActivityHeatmapRequest): Promise<ActivityHeatmapResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const url = `/usage/dashboard/activity-heatmap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<ActivityHeatmapResponse>(url)
  }

  // Repository Analysis Stats Methods

  /**
   * Get summary statistics for repository analysis.
   * Provides aggregated metrics across all analyzed repositories.
   *
   * @param params - Optional request parameters
   * @param params.period - Time period: '7d', '1w', '1m', '3m', '6m', '1y' (optional - defaults to all-time)
   * @param params.start_date - Custom start date in YYYY-MM-DD format
   * @param params.end_date - Custom end date in YYYY-MM-DD format
   * @returns Summary statistics including total repos, lines, files, etc.
   */
  async getRepositoryAnalysisSummary(
    params?: RepositoryAnalysisSummaryRequest
  ): Promise<RepositoryAnalysisSummaryResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const url = `/usage/dashboard/repo-analysis/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<RepositoryAnalysisSummaryResponse>(url)
  }

  /**
   * Get timeline data for repository analysis suitable for line graphs.
   * Provides time-series data for visualization.
   *
   * @param params - Optional request parameters
   * @param params.period - Time period: '7d', '1w', '1m', '3m', '6m', '1y' (default: '1m')
   * @param params.start_date - Custom start date in YYYY-MM-DD format
   * @param params.end_date - Custom end date in YYYY-MM-DD format
   * @param params.granularity - Data granularity: 'daily', 'weekly', 'monthly' (default: 'daily')
   * @returns Timeline data with repos analyzed, lines, files per period
   */
  async getRepositoryAnalysisTimeline(
    params?: RepositoryAnalysisTimelineRequest
  ): Promise<RepositoryAnalysisTimelineResponse> {
    const queryParams = new URLSearchParams()

    if (params?.period) queryParams.append('period', params.period)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.granularity) queryParams.append('granularity', params.granularity)

    const url = `/usage/dashboard/repo-analysis/timeline${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<RepositoryAnalysisTimelineResponse>(url)
  }
}
