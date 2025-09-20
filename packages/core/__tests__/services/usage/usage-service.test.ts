import { UsageService } from '../../../services/usage/usage-service'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {
  TrackUsageRequest,
  CreditBalanceResponse,
  CreditCheckResponse,
  UsageSummaryResponse,
  AuthorizationResponse,
  CalculateUsageResponse,
  TrackCodespaceUsageResponse,
  CodespaceTaskUsageResponse,
} from '../../../services/usage/usage-types'

describe('UsageService', () => {
  let mockAxios: MockAdapter
  let usageService: UsageService
  let config: APIServiceConfig

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    config = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }
    usageService = new UsageService(config)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('trackUsage', () => {
    it('should track usage successfully', async () => {
      const request: TrackUsageRequest = {
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
        call_seconds: 2,
        cost_amount: 0.05,
      }

      const response: TrackUsageResponse = {
        success: true,
        credits_used: 0.05,
        remaining_credits: 9.95,
        message: 'Usage tracked successfully',
      }

      mockAxios.onPost('/v1/usage/track', request).reply(200, response)

      const result = await usageService.trackUsage(request)

      expect(result).toEqual(response)
    })

    it('should handle track usage errors', async () => {
      const request: TrackUsageRequest = {
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
      }

      mockAxios.onPost('/v1/usage/track', request).reply(400, {
        detail: 'Invalid request',
      })

      await expect(usageService.trackUsage(request)).rejects.toThrow('API Error: Invalid request')
    })
  })

  describe('getCreditBalance', () => {
    it('should get credit balance successfully', async () => {
      const response: CreditBalanceResponse = {
        user_id: 'user123',
        total_consumed: 10.5,
        total_allotted: 100,
        remaining_credits: 89.5,
        utilization_percentage: 10.5,
        billing_cycle_start: '2024-01-01',
        billing_cycle_end: '2024-02-01',
        subscription: {
          plan: 'pro',
          status: 'active',
        },
      }

      mockAxios.onGet('/v1/usage/credit-balance').reply(200, response)

      const result = await usageService.getCreditBalance()

      expect(result).toEqual(response)
    })
  })

  describe('checkCredits', () => {
    it('should check credits with all parameters', async () => {
      const params = {
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
        call_seconds: 2,
      }

      const response: CreditCheckResponse = {
        has_sufficient_credits: true,
        estimated_cost: 0.05,
        remaining_credits: 89.5,
        model_key: 'gpt-4',
      }

      mockAxios
        .onGet(
          '/v1/usage/credit-check?model_key=gpt-4&input_tokens=100&output_tokens=50&call_seconds=2'
        )
        .reply(200, response)

      const result = await usageService.checkCredits(params)

      expect(result).toEqual(response)
    })

    it('should check credits with partial parameters', async () => {
      const params = {
        model_key: 'gpt-4',
        input_tokens: 100,
      }

      const response: CreditCheckResponse = {
        has_sufficient_credits: true,
        estimated_cost: 0.02,
        remaining_credits: 89.5,
        model_key: 'gpt-4',
      }

      mockAxios
        .onGet('/v1/usage/credit-check?model_key=gpt-4&input_tokens=100')
        .reply(200, response)

      const result = await usageService.checkCredits(params)

      expect(result).toEqual(response)
    })
  })

  describe('getUsageSummary', () => {
    it('should get usage summary with date range', async () => {
      const params = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      }

      const response: UsageSummaryResponse = {
        user_id: 'user123',
        period: {
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        usage_summary: {
          total_credits_used: 15.5,
          total_calls: 42,
          model_breakdown: {
            'gpt-4': { calls: 20, credits: 12.0 },
            'gpt-3.5': { calls: 22, credits: 3.5 },
          },
          daily_usage: [
            { date: '2024-01-01', credits_used: 1.5, calls: 5 },
            { date: '2024-01-02', credits_used: 2.0, calls: 8 },
          ],
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
      }

      mockAxios
        .onGet('/v1/usage/summary?start_date=2024-01-01&end_date=2024-01-31')
        .reply(200, response)

      const result = await usageService.getUsageSummary(params)

      expect(result).toEqual(response)
    })

    it('should get usage summary without date range', async () => {
      const response: UsageSummaryResponse = {
        user_id: 'user123',
        period: {
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        usage_summary: {
          total_credits_used: 15.5,
          total_calls: 42,
          model_breakdown: {},
          daily_usage: [],
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
      }

      mockAxios.onGet('/v1/usage/summary').reply(200, response)

      const result = await usageService.getUsageSummary()

      expect(result).toEqual(response)
    })
  })

  describe('getAuthorization', () => {
    it('should get authorization info successfully', async () => {
      const response: AuthorizationResponse = {
        user_id: 'user123',
        subscription: {
          plan: 'pro',
          status: 'active',
          features: ['api-access', 'priority-queue'],
        },
        usage_limits: {
          monthly_credits: 100,
          max_calls_per_day: 1000,
        },
        permissions: ['read', 'write', 'delete'],
      }

      mockAxios.onGet('/v1/usage/authorization').reply(200, response)

      const result = await usageService.getAuthorization()

      expect(result).toEqual(response)
    })
  })

  describe('getFreeUserStatus', () => {
    it('should get free user status successfully', async () => {
      const response = {
        is_free_user: true,
        has_available_credits: true,
        credits_remaining: 5.0,
        credits_expire_at: '2024-12-31',
      }

      mockAxios.onGet('/v1/usage/free-user-status').reply(200, response)

      const result = await usageService.getFreeUserStatus()

      expect(result).toEqual(response)
    })
  })

  describe('calculateUsageCost', () => {
    it('should calculate usage cost with all parameters', async () => {
      const params = {
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
        call_seconds: 2,
        cost_amount: 0.05,
      }

      const response: CalculateUsageResponse = {
        model_key: 'gpt-4',
        estimated_cost: 0.05,
        calculation_breakdown: {
          input_cost: 0.02,
          output_cost: 0.02,
          time_cost: 0.01,
          total_cost: 0.05,
        },
      }

      mockAxios
        .onGet(
          '/v1/usage/calculate?model_key=gpt-4&input_tokens=100&output_tokens=50&call_seconds=2&cost_amount=0.05'
        )
        .reply(200, response)

      const result = await usageService.calculateUsageCost(params)

      expect(result).toEqual(response)
    })
  })

  describe('trackCodespaceUsage', () => {
    it('should track codespace usage successfully', async () => {
      const request = {
        codespace_task_id: 'task123',
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
        call_seconds: 2,
        cost_amount: 0.05,
      }

      const response: TrackCodespaceUsageResponse = {
        id: 'usage123',
        codespace_task_id: 'task123',
        user_id: 'user123',
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
        call_seconds: 2,
        cost_amount: 0.05,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockAxios.onPost('/v1/usage/codespace/track', request).reply(200, response)

      const result = await usageService.trackCodespaceUsage(request)

      expect(result).toEqual(response)
    })
  })

  describe('getCodespaceTaskUsage', () => {
    it('should get codespace task usage successfully', async () => {
      const response: CodespaceTaskUsageResponse = {
        codespace_task_id: 'task123',
        total_usage: {
          total_input_tokens: 200,
          total_output_tokens: 100,
          total_call_seconds: 4,
          total_cost: 0.1,
        },
        usage_records: [
          {
            id: 'usage123',
            codespace_task_id: 'task123',
            user_id: 'user123',
            model_key: 'gpt-4',
            input_tokens: 100,
            output_tokens: 50,
            call_seconds: 2,
            cost_amount: 0.05,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      mockAxios.onGet('/v1/usage/codespace/task/task123').reply(200, response)

      const result = await usageService.getCodespaceTaskUsage('task123')

      expect(result).toEqual(response)
    })
  })

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockAxios.onGet('/v1/usage/health').reply(200, {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await usageService.healthCheck()

      expect(result).toBe(true)
    })

    it('should return false when API is not healthy', async () => {
      mockAxios.onGet('/v1/usage/health').reply(200, {
        status: 'unhealthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await usageService.healthCheck()

      expect(result).toBe(false)
    })

    it('should return false when health check fails', async () => {
      mockAxios.onGet('/v1/usage/health').reply(500)

      const result = await usageService.healthCheck()

      expect(result).toBe(false)
    })
  })
})
