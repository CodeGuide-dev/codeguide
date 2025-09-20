import { BaseService } from '../base/base-service'
import {
  CurrentSubscriptionResponse,
  UserSubscriptionsResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
} from '../../types'

export class SubscriptionService extends BaseService {
  constructor(config: any) {
    super(config)
  }

  /**
   * Get the currently active subscription for the authenticated user
   * GET /subscriptions/current
   */
  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    return this.get<CurrentSubscriptionResponse>('/subscriptions/current')
  }

  /**
   * Get all subscriptions (active and historical) for the authenticated user
   * GET /subscriptions/
   */
  async getAllSubscriptions(): Promise<UserSubscriptionsResponse> {
    return this.get<UserSubscriptionsResponse>('/subscriptions/')
  }

  /**
   * Cancel subscription but keep it active until the end of the current billing period
   * POST /subscriptions/{subscription_id}/cancel
   */
  async cancelSubscription(
    subscriptionId: string,
    request: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    return this.post<CancelSubscriptionResponse>(
      `/subscriptions/${subscriptionId}/cancel`,
      request
    )
  }

  /**
   * Get subscription details by ID
   * GET /subscriptions/{subscription_id}
   */
  async getSubscriptionById(subscriptionId: string): Promise<{
    status: string
    data: {
      subscription: any
      product: any
      price: any
    }
  }> {
    return this.get(`/subscriptions/${subscriptionId}`)
  }

  /**
   * Reactivate a canceled subscription (if supported by API)
   * POST /subscriptions/{subscription_id}/reactivate
   */
  async reactivateSubscription(subscriptionId: string): Promise<{
    status: string
    message: string
    data: any
  }> {
    return this.post(`/subscriptions/${subscriptionId}/reactivate`, {})
  }

  /**
   * Update subscription quantity or other parameters
   * PUT /subscriptions/{subscription_id}
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      quantity?: number
      metadata?: Record<string, any>
    }
  ): Promise<{
    status: string
    data: any
  }> {
    return this.put(`/subscriptions/${subscriptionId}`, updates)
  }

  /**
   * Get subscription usage statistics (if supported by API)
   * GET /subscriptions/{subscription_id}/usage
   */
  async getSubscriptionUsage(subscriptionId: string): Promise<{
    status: string
    data: {
      current_usage: number
      limit: number
      period_start: string
      period_end: string
      usage_breakdown?: Array<{
        feature: string
        used: number
        limit: number
      }>
    }
  }> {
    return this.get(`/subscriptions/${subscriptionId}/usage`)
  }

  /**
   * Get upcoming invoice for subscription
   * GET /subscriptions/{subscription_id}/upcoming-invoice
   */
  async getUpcomingInvoice(subscriptionId: string): Promise<{
    status: string
    data: {
      amount: number
      currency: string
      date: string
      line_items: Array<{
        description: string
        amount: number
        currency: string
      }>
    }
  }> {
    return this.get(`/subscriptions/${subscriptionId}/upcoming-invoice`)
  }

  /**
   * Get subscription history and payments
   * GET /subscriptions/{subscription_id}/history
   */
  async getSubscriptionHistory(subscriptionId: string): Promise<{
    status: string
    data: Array<{
      id: string
      type: 'payment' | 'invoice' | 'refund'
      amount: number
      currency: string
      status: string
      created: string
      description?: string
    }>
  }> {
    return this.get(`/subscriptions/${subscriptionId}/history`)
  }
}