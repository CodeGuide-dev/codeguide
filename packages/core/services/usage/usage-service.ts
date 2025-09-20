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

    if (params.input_tokens !== undefined)
      queryParams.append('input_tokens', params.input_tokens.toString())
    if (params.output_tokens !== undefined)
      queryParams.append('output_tokens', params.output_tokens.toString())
    if (params.call_seconds !== undefined)
      queryParams.append('call_seconds', params.call_seconds.toString())

    const url = `/usage/credit-check?${queryParams.toString()}`
    return this.get<CreditCheckResponse>(url)
  }

  async getUsageSummary(params?: UsageSummaryRequest): Promise<UsageSummaryResponse> {
    const queryParams = new URLSearchParams()

    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const url = `/usage/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.get<UsageSummaryResponse>(url)
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
}
