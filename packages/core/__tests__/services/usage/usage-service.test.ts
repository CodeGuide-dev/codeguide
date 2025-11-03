import { UsageService } from '../../../services/usage/usage-service'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {
  TrackUsageRequest,
  TrackUsageResponse,
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
        success: true,
        data: {
          user_id: 'user_32CKVjVlcRfh4HAqpVckgILey0Z',
          subscription: null,
          credit_balance: {
            total_allotted: 500,
            total_consumed: 0,
            remaining_credits: 500,
            is_over_limit: false,
            utilization_percentage: 0.0,
            billing_cycle_start: '2025-11-03',
            billing_cycle_end: '2025-11-10',
          },
          has_active_subscription: false,
          has_previous_subscriptions: false,
          is_within_credit_limit: true,
          authorization_level: 'free',
          restrictions: [],
          can_create_tasks: true,
          can_analyze_repos: true,
          can_access_previous_projects: false,
          plan_limits: {
            plan_type: 'free',
            limits: {
              codespace_tasks: {
                allowed: true,
                current_usage: 0,
                limit: 2,
                remaining: 2,
                period_type: 'lifetime',
                period_start: null,
                period_end: null,
                message: 'Can create 2 more codespace tasks. 2 codespace tasks (lifetime limit)',
                is_unlimited: false,
              },
              api_calls: {
                limit: 500,
                period: '7_days',
                description: '500 API credits (valid for 7 days)',
                is_unlimited: false,
              },
              storage_gb: {
                limit: 1,
                period: 'lifetime',
                description: '1 GB storage',
                is_unlimited: false,
              },
              projects: {
                limit: 3,
                period: 'lifetime',
                description: '3 projects maximum',
                is_unlimited: false,
              },
              collaborators: {
                limit: 0,
                period: 'lifetime',
                description: 'No team collaboration',
                is_unlimited: false,
              },
            },
          },
          codespace_task_limit: {
            allowed: true,
            current_usage: 0,
            limit: 2,
            remaining: 2,
            period_type: 'lifetime',
            period_start: null,
            period_end: null,
            message: 'Can create 2 more codespace tasks. 2 codespace tasks (lifetime limit)',
            is_unlimited: false,
          },
        },
        message: 'Authorization status retrieved successfully',
      }

      mockAxios.onGet('/v1/usage/authorization').reply(200, response)

      const result = await usageService.getAuthorization()

      expect(result).toEqual(response)
    })

    it('should get authorization info for subscribed user successfully', async () => {
      const response: AuthorizationResponse = {
        success: true,
        data: {
          user_id: 'user_2qaB6nlVH3R9QXhQZpt1nmVDymN',
          subscription: {
            id: 'sub_1RbggdFb0vIg7N8EFOPTEhDh',
            status: 'active',
            interval: 'month',
            current_period_start: '2025-10-19T11:31:19+00:00',
            current_period_end: '2025-11-19T11:31:19+00:00',
            price_id: 'price_1QYtmGFb0vIg7N8E71nw8g27',
            product_name: null,
            plan_name: 'Monthly Plan',
          },
          credit_balance: {
            total_allotted: 5000,
            total_consumed: 658,
            remaining_credits: 4342,
            is_over_limit: false,
            utilization_percentage: 13.16,
            billing_cycle_start: '2025-10-19',
            billing_cycle_end: '2025-11-19',
          },
          has_active_subscription: true,
          has_previous_subscriptions: true,
          is_within_credit_limit: true,
          authorization_level: 'basic',
          restrictions: [],
          can_create_tasks: true,
          can_analyze_repos: true,
          can_access_previous_projects: true,
          plan_limits: {
            plan_type: 'basic',
            limits: {
              codespace_tasks: {
                allowed: true,
                current_usage: 0,
                limit: -1,
                remaining: -1,
                period_type: 'monthly',
                period_start: null,
                period_end: null,
                message: 'Unlimited codespace tasks',
                is_unlimited: true,
              },
              api_calls: {
                limit: 5000,
                period: 'monthly',
                description: '5000 API credits per month',
                is_unlimited: false,
              },
              storage_gb: {
                limit: 10,
                period: 'lifetime',
                description: '10 GB storage',
                is_unlimited: false,
              },
              projects: {
                limit: 20,
                period: 'lifetime',
                description: '20 projects maximum',
                is_unlimited: false,
              },
              collaborators: {
                limit: 3,
                period: 'monthly',
                description: '3 team collaborators',
                is_unlimited: false,
              },
            },
          },
          codespace_task_limit: null,
        },
        message: 'Authorization status retrieved successfully',
      }

      mockAxios.onGet('/v1/usage/authorization').reply(200, response)

      const result = await usageService.getAuthorization()

      expect(result).toEqual(response)
      expect(result.data.has_active_subscription).toBe(true)
      expect(result.data.subscription).not.toBeNull()
      expect(result.data.subscription?.plan_name).toBe('Monthly Plan')
      expect(result.data.codespace_task_limit).toBeNull()
      expect(result.data.plan_limits.limits.codespace_tasks.is_unlimited).toBe(true)
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
