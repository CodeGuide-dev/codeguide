import { UsageService } from '../../../services/usage/usage-service'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {
  TrackUsageRequest,
  TrackUsageResponse,
  CreditBalanceResponse,
  CreditBalanceData,
  CreditCheckResponse,
  UsageSummaryResponse,
  AuthorizationResponse,
  CalculateUsageResponse,
  TrackCodespaceUsageResponse,
  CodespaceTaskUsageResponse,
  DashboardAnalyticsRequest,
  DashboardAnalyticsResponse,
  UsageDetailsRequest,
  UsageDetailsResponse,
  ServiceBreakdownRequest,
  ServiceBreakdownResponse,
} from '../../../services/usage/usage-types'

describe('UsageService', () => {
  let mockAxios: MockAdapter
  let usageService: UsageService
  let config: APIServiceConfig

  beforeEach(() => {
    config = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }
    usageService = new UsageService(config)
    mockAxios = new MockAdapter((usageService as any).client)
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

      mockAxios.onPost('/usage/track', request).reply(200, response)

      const result = await usageService.trackUsage(request)

      expect(result).toEqual(response)
    })

    it('should handle track usage errors', async () => {
      const request: TrackUsageRequest = {
        model_key: 'gpt-4',
        input_tokens: 100,
        output_tokens: 50,
      }

      mockAxios.onPost('/usage/track', request).reply(400, {
        detail: 'Invalid request',
      })

      await expect(usageService.trackUsage(request)).rejects.toThrow('API Error: Invalid request')
    })
  })

  describe('getCreditBalance', () => {
    it('should get credit balance successfully', async () => {
      const creditBalanceData: CreditBalanceData = {
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

      const response: CreditBalanceResponse = {
        data: creditBalanceData,
      }

      mockAxios.onGet('/usage/credit-balance').reply(200, response)

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
          '/usage/credit-check?model_key=gpt-4&input_tokens=100&output_tokens=50&call_seconds=2'
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
        .onGet('/usage/credit-check?model_key=gpt-4&input_tokens=100')
        .reply(200, response)

      const result = await usageService.checkCredits(params)

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

      mockAxios.onGet('/usage/authorization').reply(200, response)

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

      mockAxios.onGet('/usage/authorization').reply(200, response)

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

      mockAxios.onGet('/usage/free-user-status').reply(200, response)

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
          '/usage/calculate?model_key=gpt-4&input_tokens=100&output_tokens=50&call_seconds=2&cost_amount=0.05'
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

      mockAxios.onPost('/usage/codespace/track', request).reply(200, response)

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

      mockAxios.onGet('/usage/codespace/task/task123').reply(200, response)

      const result = await usageService.getCodespaceTaskUsage('task123')

      expect(result).toEqual(response)
    })
  })

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockAxios.onGet('/usage/health').reply(200, {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await usageService.healthCheck()

      expect(result).toBe(true)
    })

    it('should return false when API is not healthy', async () => {
      mockAxios.onGet('/usage/health').reply(200, {
        status: 'unhealthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await usageService.healthCheck()

      expect(result).toBe(false)
    })

    it('should return false when health check fails', async () => {
      mockAxios.onGet('/usage/health').reply(500)

      const result = await usageService.healthCheck()

      expect(result).toBe(false)
    })
  })

  // Dashboard Analytics Tests
  describe('getDashboardAnalytics', () => {
    it('should get dashboard analytics with period parameter', async () => {
      const params: DashboardAnalyticsRequest = {
        period: '7d'
      }

      const response: DashboardAnalyticsResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-25',
            end: '2024-01-31',
            label: '7d'
          },
          daily_usage: [
            {
              date: '2024-01-25',
              credits_consumed: 1250,
              cost_usd: 3.75,
              requests_count: 15,
              average_credits_per_request: 83.33
            }
          ],
          totals: {
            credits_consumed: 13870,
            cost_usd: 41.61,
            requests_count: 142
          },
          averages: {
            daily_credits: 1981.43,
            daily_requests: 20.29
          },
          trends: {
            credits_consumed: 15.7,
            requests_count: 8.3
          },
          top_services: [
            {
              service_type: 'docs',
              credits_consumed: 5230,
              requests_count: 58
            }
          ]
        }
      }

      mockAxios.onGet('/usage/dashboard/analytics?period=7d').reply(200, response)

      const result = await usageService.getDashboardAnalytics(params)

      expect(result).toEqual(response)
    })

    it('should get dashboard analytics with all parameters', async () => {
      const params: DashboardAnalyticsRequest = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        service_type: 'docs'
      }

      const response: DashboardAnalyticsResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            label: 'custom'
          },
          daily_usage: [],
          totals: {
            credits_consumed: 5000,
            cost_usd: 15.0,
            requests_count: 45
          },
          averages: {
            daily_credits: 161.29,
            daily_requests: 1.45
          },
          trends: {
            credits_consumed: 12.5,
            requests_count: 5.2
          },
          top_services: [
            {
              service_type: 'docs',
              credits_consumed: 5000,
              requests_count: 45
            }
          ]
        }
      }

      mockAxios.onGet('/usage/dashboard/analytics?start_date=2024-01-01&end_date=2024-01-31&service_type=docs').reply(200, response)

      const result = await usageService.getDashboardAnalytics(params)

      expect(result).toEqual(response)
    })

    it('should get dashboard analytics without parameters', async () => {
      const response: DashboardAnalyticsResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-01',
            end: '2024-01-07',
            label: '7d'
          },
          daily_usage: [],
          totals: {
            credits_consumed: 1000,
            cost_usd: 3.0,
            requests_count: 10
          },
          averages: {
            daily_credits: 142.86,
            daily_requests: 1.43
          },
          trends: {
            credits_consumed: 5.0,
            requests_count: 2.0
          },
          top_services: []
        }
      }

      mockAxios.onGet('/usage/dashboard/analytics').reply(200, response)

      const result = await usageService.getDashboardAnalytics()

      expect(result).toEqual(response)
    })
  })

  describe('getUsageDetails', () => {
    it('should get usage details with pagination parameters', async () => {
      const params: UsageDetailsRequest = {
        page: 1,
        page_size: 25,
        sort_by: 'credits_consumed',
        sort_order: 'desc'
      }

      const response: UsageDetailsResponse = {
        status: 'success',
        data: [
          {
            id: 'rec_123456789',
            created_at: '2024-01-31T14:30:15.123Z',
            service_type: 'docs',
            model_name: 'GPT-4',
            usage_type: 'output_tokens',
            units_consumed: 1250,
            credits_consumed: 156,
            cost_amount: 0.468
          }
        ],
        pagination: {
          page: 1,
          page_size: 25,
          total_count: 142,
          total_pages: 6,
          has_next: true,
          has_prev: false
        },
        filters: {
          period: null,
          start_date: null,
          end_date: null,
          service_type: null
        }
      }

      mockAxios.onGet('/usage/dashboard/details?page=1&page_size=25&sort_by=credits_consumed&sort_order=desc').reply(200, response)

      const result = await usageService.getUsageDetails(params)

      expect(result).toEqual(response)
    })

    it('should get usage details with filtering parameters', async () => {
      const params: UsageDetailsRequest = {
        period: '1m',
        service_type: 'chat'
      }

      const response: UsageDetailsResponse = {
        status: 'success',
        data: [
          {
            id: 'rec_123456790',
            created_at: '2024-01-30T10:15:20.456Z',
            service_type: 'chat',
            model_name: 'GPT-3.5 Turbo',
            usage_type: 'input_tokens',
            units_consumed: 890,
            credits_consumed: 89,
            cost_amount: null
          }
        ],
        pagination: {
          page: 1,
          page_size: 50,
          total_count: 25,
          total_pages: 1,
          has_next: false,
          has_prev: false
        },
        filters: {
          period: '1m',
          start_date: null,
          end_date: null,
          service_type: 'chat'
        }
      }

      mockAxios.onGet('/usage/dashboard/details?period=1m&service_type=chat').reply(200, response)

      const result = await usageService.getUsageDetails(params)

      expect(result).toEqual(response)
    })
  })

  describe('getUsageSummary', () => {
    it('should get usage summary dashboard with period parameter', async () => {
      const params = {
        period: '7d' as const
      }

      const response: UsageSummaryResponse = {
        status: 'success',
        data: {
          current_period: {
            credits_consumed: 13870,
            cost_usd: 41.61,
            requests_count: 142
          },
          previous_period: {
            credits_consumed: 11990,
            cost_usd: 35.97,
            requests_count: 131
          },
          billing_cycle: {
            total_allotted: 50000,
            total_consumed: 28450,
            remaining_credits: 21550
          },
          utilization_percentage: 56.9,
          remaining_credits: 21550,
          daily_average: 1981.43,
          projected_monthly: 59443
        }
      }

      mockAxios.onGet('/usage/dashboard/summary?period=7d').reply(200, response)

      const result = await usageService.getUsageSummary(params)

      expect(result).toEqual(response)
    })

    it('should get usage summary dashboard with custom date range', async () => {
      const params = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }

      const response: UsageSummaryResponse = {
        status: 'success',
        data: {
          current_period: {
            credits_consumed: 25000,
            cost_usd: 75.0,
            requests_count: 300
          },
          previous_period: {
            credits_consumed: 22000,
            cost_usd: 66.0,
            requests_count: 275
          },
          billing_cycle: {
            total_allotted: 50000,
            total_consumed: 47000,
            remaining_credits: 3000
          },
          utilization_percentage: 94.0,
          remaining_credits: 3000,
          daily_average: 806.45,
          projected_monthly: 25000
        }
      }

      mockAxios.onGet('/usage/dashboard/summary?start_date=2024-01-01&end_date=2024-01-31').reply(200, response)

      const result = await usageService.getUsageSummary(params)

      expect(result).toEqual(response)
    })
  })

  describe('getServiceBreakdown', () => {
    it('should get service breakdown with period parameter', async () => {
      const params: ServiceBreakdownRequest = {
        period: '7d'
      }

      const response: ServiceBreakdownResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-25',
            end: '2024-01-31',
            label: '7d'
          },
          services: [
            {
              service_type: 'docs',
              credits_consumed: 5230,
              percentage: 37.71,
              cost_usd: 15.69,
              requests_count: 58,
              trend: 12.5
            },
            {
              service_type: 'chat',
              credits_consumed: 4120,
              percentage: 29.71,
              cost_usd: 12.36,
              requests_count: 47,
              trend: -5.2
            }
          ],
          total_credits: 13870,
          total_cost: 41.61
        }
      }

      mockAxios.onGet('/usage/dashboard/services?period=7d').reply(200, response)

      const result = await usageService.getServiceBreakdown(params)

      expect(result).toEqual(response)
    })

    it('should get service breakdown with custom date range', async () => {
      const params: ServiceBreakdownRequest = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }

      const response: ServiceBreakdownResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            label: 'custom'
          },
          services: [
            {
              service_type: 'codespace_task',
              credits_consumed: 15000,
              percentage: 60.0,
              cost_usd: 45.0,
              requests_count: 25,
              trend: 28.4
            }
          ],
          total_credits: 25000,
          total_cost: 75.0
        }
      }

      mockAxios.onGet('/usage/dashboard/services?start_date=2024-01-01&end_date=2024-01-31').reply(200, response)

      const result = await usageService.getServiceBreakdown(params)

      expect(result).toEqual(response)
    })

    it('should get service breakdown without parameters', async () => {
      const response: ServiceBreakdownResponse = {
        status: 'success',
        data: {
          period: {
            start: '2024-01-01',
            end: '2024-01-07',
            label: '7d'
          },
          services: [
            {
              service_type: 'api',
              credits_consumed: 700,
              percentage: 100.0,
              cost_usd: 2.10,
              requests_count: 5,
              trend: 0.0
            }
          ],
          total_credits: 700,
          total_cost: 2.10
        }
      }

      mockAxios.onGet('/usage/dashboard/services').reply(200, response)

      const result = await usageService.getServiceBreakdown()

      expect(result).toEqual(response)
    })
  })
})
