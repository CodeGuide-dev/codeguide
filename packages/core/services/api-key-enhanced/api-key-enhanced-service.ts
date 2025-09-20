import { BaseService } from '../base/base-service'
import {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKeyPermission,
  RevokeApiKeyResponse,
} from '../../types'

export class ApiKeyEnhancedService extends BaseService {
  constructor(config: any) {
    super(config)
  }

  /**
   * Get all API keys for the authenticated user
   * GET /api-key-enhanced/
   */
  async getAllApiKeys(): Promise<ApiKey[]> {
    return this.get<ApiKey[]>('/api-key-enhanced/')
  }

  /**
   * Create a new API key
   * POST /api-key-enhanced/
   */
  async createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    return this.post<CreateApiKeyResponse>('/api-key-enhanced/', request)
  }

  /**
   * Revoke an API key by ID
   * DELETE /api-key-enhanced/{api_key_id}
   */
  async revokeApiKey(apiKeyId: string): Promise<RevokeApiKeyResponse> {
    return this.delete<RevokeApiKeyResponse>(`/api-key-enhanced/${apiKeyId}`)
  }

  /**
   * Check if user can create API keys
   * GET /api-key-enhanced/check-permission
   */
  async checkApiKeyPermission(): Promise<ApiKeyPermission> {
    return this.get<ApiKeyPermission>('/api-key-enhanced/check-permission')
  }

  /**
   * Get API key details by ID
   * GET /api-key-enhanced/{api_key_id}
   */
  async getApiKeyById(apiKeyId: string): Promise<ApiKey> {
    return this.get<ApiKey>(`/api-key-enhanced/${apiKeyId}`)
  }

  /**
   * Update API key name (if supported by API)
   * PUT /api-key-enhanced/{api_key_id}
   */
  async updateApiKeyName(apiKeyId: string, name: string): Promise<ApiKey> {
    return this.put<ApiKey>(`/api-key-enhanced/${apiKeyId}`, { name })
  }

  /**
   * Toggle API key active status (if supported by API)
   * PATCH /api-key-enhanced/{api_key_id}/toggle
   */
  async toggleApiKeyStatus(apiKeyId: string): Promise<ApiKey> {
    return this.post<ApiKey>(`/api-key-enhanced/${apiKeyId}/toggle`, {})
  }

  /**
   * Get API key usage statistics (if supported by API)
   * GET /api-key-enhanced/{api_key_id}/usage
   */
  async getApiKeyUsage(apiKeyId: string): Promise<{
    usage_count: number
    last_used?: string
    daily_usage?: Array<{ date: string; count: number }>
  }> {
    return this.get(`/api-key-enhanced/${apiKeyId}/usage`)
  }
}