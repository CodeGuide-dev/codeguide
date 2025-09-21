import { BaseService } from '../base/base-service'
import {
  CancellationFunnelInitiateRequest,
  CancellationFunnelInitiateResponse,
  CancellationFunnelPauseOfferRequest,
  CancellationFunnelPauseOfferResponse,
  CancellationFunnelSurveyRequest,
  CancellationFunnelSurveyResponse,
} from '../../types'

export class CancellationFunnelService extends BaseService {
  constructor(config: any) {
    super(config)
  }

  /**
   * Initiate Cancellation Flow
   * POST /cancellation-funnel/initiate
   */
  async initiateCancellation(
    request: CancellationFunnelInitiateRequest
  ): Promise<CancellationFunnelInitiateResponse> {
    return this.post<CancellationFunnelInitiateResponse>(
      '/cancellation-funnel/initiate',
      request
    )
  }

  /**
   * Log Pause Offer Response
   * POST /cancellation-funnel/pause-offer
   */
  async logPauseOfferResponse(
    request: CancellationFunnelPauseOfferRequest
  ): Promise<CancellationFunnelPauseOfferResponse> {
    return this.post<CancellationFunnelPauseOfferResponse>(
      '/cancellation-funnel/pause-offer',
      request
    )
  }

  /**
   * Log Survey Response
   * POST /cancellation-funnel/survey
   */
  async logSurveyResponse(
    request: CancellationFunnelSurveyRequest
  ): Promise<CancellationFunnelSurveyResponse> {
    return this.post<CancellationFunnelSurveyResponse>(
      '/cancellation-funnel/survey',
      request
    )
  }

  /**
   * Get Cancellation Funnel Status
   * GET /cancellation-funnel/{subscription_id}/status
   */
  async getCancellationFunnelStatus(
    subscriptionId: string
  ): Promise<{
    status: string
    data: {
      funnel_id: string
      subscription_id: string
      current_step: string
      initiated_at: string
      pause_offer_response?: {
        action: 'accepted' | 'declined'
        pause_duration_months?: number
        responded_at: string
      }
      survey_response?: {
        reason: string
        feedback?: string
        competitor_name?: string
        submitted_at: string
      }
      is_completed: boolean
      completed_at?: string
    }
  }> {
    return this.get(`/cancellation-funnel/${subscriptionId}/status`)
  }

  /**
   * Get Available Cancellation Offers
   * GET /cancellation-funnel/{subscription_id}/offers
   */
  async getAvailableOffers(
    subscriptionId: string
  ): Promise<{
    status: string
    data: {
      subscription_id: string
      available_offers: Array<{
        type: 'pause' | 'discount' | 'downgrade' | 'feature_change'
        title: string
        description: string
        details?: Record<string, any>
        valid_until?: string
      }>
      eligibility_check: {
        is_eligible: boolean
        reasons?: string[]
      }
    }
  }> {
    return this.get(`/cancellation-funnel/${subscriptionId}/offers`)
  }

  /**
   * Complete Cancellation Funnel
   * POST /cancellation-funnel/{subscription_id}/complete
   */
  async completeCancellationFunnel(
    subscriptionId: string,
    finalAction: 'cancel' | 'retain'
  ): Promise<{
    status: string
    message: string
    data: {
      funnel_id: string
      subscription_id: string
      final_action: 'cancel' | 'retain'
      completed_at: string
      outcome: {
        subscription_cancelled: boolean
        effective_date?: string
        retention_action?: string
      }
    }
  }> {
    return this.post(`/cancellation-funnel/${subscriptionId}/complete`, {
      final_action: finalAction,
    })
  }

  /**
   * Get Cancellation Reasons (for survey dropdown)
   * GET /cancellation-funnel/reasons
   */
  async getCancellationReasons(): Promise<{
    status: string
    data: Array<{
      id: string
      label: string
      description: string
      requires_feedback: boolean
      requires_competitor: boolean
      category: 'pricing' | 'features' | 'usability' | 'support' | 'other'
    }>
  }> {
    return this.get('/cancellation-funnel/reasons')
  }

  /**
   * Save Funnel Progress (for multi-step funnels)
   * PUT /cancellation-funnel/{subscription_id}/progress
   */
  async saveFunnelProgress(
    subscriptionId: string,
    progress: {
      current_step: string
      step_data?: Record<string, any>
      completed_steps: string[]
    }
  ): Promise<{
    status: string
    message: string
    data: {
      funnel_id: string
      subscription_id: string
      progress: {
        current_step: string
        step_data?: Record<string, any>
        completed_steps: string[]
        last_updated: string
      }
    }
  }> {
    return this.put(`/cancellation-funnel/${subscriptionId}/progress`, progress)
  }

  /**
   * Skip Funnel Step (for optional steps)
   * POST /cancellation-funnel/{subscription_id}/skip-step
   */
  async skipFunnelStep(
    subscriptionId: string,
    stepToSkip: string
  ): Promise<{
    status: string
    message: string
    data: {
      funnel_id: string
      subscription_id: string
      skipped_step: string
      next_step: string
      progress_updated_at: string
    }
  }> {
    return this.post(`/cancellation-funnel/${subscriptionId}/skip-step`, {
      step_to_skip: stepToSkip,
    })
  }

  /**
   * Get Retention Offers (based on cancellation reason)
   * GET /cancellation-funnel/{subscription_id}/retention-offers
   */
  async getRetentionOffers(
    subscriptionId: string,
    reason?: string
  ): Promise<{
    status: string
    data: {
      subscription_id: string
      cancellation_reason?: string
      retention_offers: Array<{
        id: string
        type: 'discount' | 'upgrade' | 'extension' | 'feature_unlock'
        title: string
        description: string
        value: {
          amount?: number
          percentage?: number
          duration?: string
          features?: string[]
        }
        expiration_date?: string
        auto_apply: boolean
      }>
    }
  }> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    return this.get(`/cancellation-funnel/${subscriptionId}/retention-offers${params}`)
  }
}