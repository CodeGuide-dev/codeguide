import { BaseService } from '../base/base-service'
import { APIServiceConfig } from '../../types'
import {
  CreateProviderAPIKeyRequest,
  CreateProviderAPIKeyResponse,
  GetProviderAPIKeyResponse,
  ListProviderAPIKeysResponse,
  RevokeProviderAPIKeyResponse,
  CreateGitHubTokenRequest,
  CreateGitHubTokenResponse,
  GetGitHubTokenResponse,
  RevokeGitHubTokenResponse,
  SecurityKeysError
} from './security-keys-types'

/**
 * Security Keys Service
 *
 * This service provides methods for managing security keys including:
 * - Provider API Keys (OpenAI, Anthropic, etc.)
 * - GitHub Tokens
 *
 * API endpoints match the actual backend implementation:
 * - POST /security-keys/provider-api-key
 * - GET /security-keys/provider-api-key/{provider_key}
 * - GET /security-keys/provider-api-keys
 * - DELETE /security-keys/provider-api-key/{provider_key}
 * - POST /security-keys/github-token
 * - GET /security-keys/github-token
 * - DELETE /security-keys/github-token
 */
export class SecurityKeysService extends BaseService {
  constructor(config: APIServiceConfig) {
    super(config)
  }

  // ============================================================================
  // Provider API Key Methods
  // ============================================================================

  /**
   * Save a new provider API key
   *
   * POST /security-keys/provider-api-key
   *
   * @param request - The provider API key creation request
   * @returns Promise resolving to the created API key response
   * @throws {Error} When provider_id or api_key is missing
   */
  async createProviderAPIKey(request: CreateProviderAPIKeyRequest): Promise<CreateProviderAPIKeyResponse> {
    this.validateProviderAPIKeyRequest(request)

    return this.post<CreateProviderAPIKeyResponse>(
      '/security-keys/provider-api-key',
      request
    )
  }

  /**
   * Get a provider API key by provider key
   *
   * GET /security-keys/provider-api-key/{provider_key}
   *
   * @param providerKey - The provider key (e.g., 'openai', 'anthropic')
   * @param reveal - Whether to reveal the actual API key (default: false)
   * @returns Promise resolving to the API key response
   * @throws {Error} When provider_key is missing
   */
  async getProviderAPIKey(providerKey: string, reveal: boolean = false): Promise<GetProviderAPIKeyResponse> {
    if (!providerKey) {
      throw new Error('provider_key is required')
    }

    const url = reveal
      ? `/security-keys/provider-api-key/${providerKey}?reveal=true`
      : `/security-keys/provider-api-key/${providerKey}`

    return this.get<GetProviderAPIKeyResponse>(url)
  }

  /**
   * List all provider API keys
   *
   * GET /security-keys/provider-api-keys
   *
   * @param reveal - Whether to reveal the actual API keys (default: false)
   * @returns Promise resolving to the list of all provider API keys
   */
  async listProviderAPIKeys(reveal: boolean = false): Promise<ListProviderAPIKeysResponse> {
    const url = reveal
      ? '/security-keys/provider-api-keys?reveal=true'
      : '/security-keys/provider-api-keys'

    return this.get<ListProviderAPIKeysResponse>(url)
  }

  /**
   * Delete a provider API key by provider key
   *
   * DELETE /security-keys/provider-api-key/{provider_key}
   *
   * @param providerKey - The provider key (e.g., 'openai', 'anthropic')
   * @returns Promise resolving to the deletion response
   * @throws {Error} When provider_key is missing
   */
  async revokeProviderAPIKey(providerKey: string): Promise<RevokeProviderAPIKeyResponse> {
    if (!providerKey) {
      throw new Error('provider_key is required')
    }

    return this.delete<RevokeProviderAPIKeyResponse>(`/security-keys/provider-api-key/${providerKey}`)
  }

  // ============================================================================
  // GitHub Token Methods
  // ============================================================================

  /**
   * Save a new GitHub token
   *
   * POST /security-keys/github-token
   *
   * @param request - The GitHub token creation request
   * @returns Promise resolving to the created GitHub token response
   * @throws {Error} When github_token is missing or invalid
   */
  async createGitHubToken(request: CreateGitHubTokenRequest): Promise<CreateGitHubTokenResponse> {
    this.validateGitHubTokenRequest(request)

    return this.post<CreateGitHubTokenResponse>(
      '/security-keys/github-token',
      request
    )
  }

  /**
   * Get the GitHub token
   *
   * GET /security-keys/github-token
   *
   * @param reveal - Whether to reveal the actual token (default: false)
   * @returns Promise resolving to the GitHub token response
   */
  async getGitHubToken(reveal: boolean = false): Promise<GetGitHubTokenResponse> {
    const url = reveal
      ? '/security-keys/github-token?reveal=true'
      : '/security-keys/github-token'

    return this.get<GetGitHubTokenResponse>(url)
  }

  /**
   * Delete the GitHub token
   *
   * DELETE /security-keys/github-token
   *
   * @returns Promise resolving to the deletion response
   */
  async revokeGitHubToken(): Promise<RevokeGitHubTokenResponse> {
    return this.delete<RevokeGitHubTokenResponse>('/security-keys/github-token')
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Validate provider API key creation request
   *
   * @param request - The request to validate
   * @throws {Error} When validation fails
   */
  private validateProviderAPIKeyRequest(request: CreateProviderAPIKeyRequest): void {
    if (!request.provider_key) {
      throw new Error('provider_key is required')
    }
    if (!request.api_key) {
      throw new Error('api_key is required')
    }
    if (request.api_key.length < 10) {
      throw new Error('api_key must be at least 10 characters long')
    }
  }

  /**
   * Validate GitHub token creation request
   * Matches the API validation for GitHub token formats
   *
   * @param request - The request to validate
   * @throws {Error} When validation fails
   */
  private validateGitHubTokenRequest(request: CreateGitHubTokenRequest): void {
    if (!request.github_token) {
      throw new Error('github_token is required')
    }

    // Valid GitHub token prefixes according to the API
    const validPrefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_', 'github_pat_']
    const hasValidPrefix = validPrefixes.some(prefix => request.github_token.startsWith(prefix))

    if (!hasValidPrefix) {
      throw new Error('Invalid GitHub token format. Expected format: ghp_*, gho_*, ghu_*, ghs_*, or ghr_* followed by 36 characters')
    }

    // GitHub tokens should be at least 40 characters (prefix + 36 chars)
    if (request.github_token.length < 40) {
      throw new Error('GitHub token must be at least 40 characters long')
    }
  }

  /**
   * Handle API errors consistently
   *
   * @param error - The error response from the API
   * @throws {Error} With the API error message
   */
  private handleAPIError(error: any): never {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail)
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    if (error.message) {
      throw new Error(error.message)
    }
    throw new Error('An unexpected error occurred')
  }
}