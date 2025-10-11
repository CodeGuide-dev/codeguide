import { BaseService } from '../base/base-service'
import {
  StoreExternalTokenRequest,
  StoreExternalTokenResponse,
  StoreWithDetectionRequest,
  StoreWithDetectionResponse,
  ListTokensQuery,
  ListTokensResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  FindBestMatchRequest,
  FindBestMatchResponse,
  TestStoredTokenRequest,
  TestStoredTokenResponse,
  GetTokenResponse,
  UpdateTokenRequest,
  UpdateTokenResponse,
  RevokeTokenResponse,
  SupportedPlatformsResponse,
  StoreGitHubTokenRequest,
  StoreGitLabTokenRequest,
  Platform,
} from './external-tokens-types'

export class ExternalTokenService extends BaseService {
  // Core Storage Endpoints

  async storeExternalToken(request: StoreExternalTokenRequest): Promise<StoreExternalTokenResponse> {
    this.validateStoreRequest(request)
    return this.post<StoreExternalTokenResponse>('/external-tokens/store', request)
  }

  async storeWithDetection(request: StoreWithDetectionRequest): Promise<StoreWithDetectionResponse> {
    if (!request.token) {
      throw new Error('token is required')
    }
    if (!request.token_name) {
      throw new Error('token_name is required')
    }
    return this.post<StoreWithDetectionResponse>('/external-tokens/store-with-detection', request)
  }

  // Platform-Specific Endpoints (Backward Compatible)

  async storeGitHubToken(request: StoreGitHubTokenRequest): Promise<StoreExternalTokenResponse> {
    if (!request.token) {
      throw new Error('token is required')
    }
    if (!request.token_name) {
      throw new Error('token_name is required')
    }
    return this.post<StoreExternalTokenResponse>('/external-tokens/store/github', request)
  }

  async storeGitLabToken(request: StoreGitLabTokenRequest): Promise<StoreExternalTokenResponse> {
    if (!request.token) {
      throw new Error('token is required')
    }
    if (!request.token_name) {
      throw new Error('token_name is required')
    }
    return this.post<StoreExternalTokenResponse>('/external-tokens/store/gitlab', request)
  }

  // Retrieval Endpoints

  async listTokens(query?: ListTokensQuery): Promise<ListTokensResponse> {
    const params = new URLSearchParams()

    if (query?.platform) {
      params.append('platform', query.platform)
    }
    if (query?.include_inactive !== undefined) {
      params.append('include_inactive', query.include_inactive.toString())
    }
    if (query?.page) {
      params.append('page', query.page.toString())
    }
    if (query?.per_page) {
      params.append('per_page', query.per_page.toString())
    }

    const queryString = params.toString()
    const url = queryString ? `/external-tokens/?${queryString}` : '/external-tokens/'

    return this.get<ListTokensResponse>(url)
  }

  async getToken(tokenId: string): Promise<GetTokenResponse> {
    if (!tokenId) {
      throw new Error('token_id is required')
    }
    return this.get<GetTokenResponse>(`/external-tokens/${tokenId}`)
  }

  // Validation and Testing Endpoints

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    if (!request.token) {
      throw new Error('token is required')
    }
    return this.post<ValidateTokenResponse>('/external-tokens/validate', request)
  }

  async findBestMatch(request: FindBestMatchRequest): Promise<FindBestMatchResponse> {
    if (!request.repository_url) {
      throw new Error('repository_url is required')
    }
    return this.post<FindBestMatchResponse>('/external-tokens/find-best-match', request)
  }

  async testStoredToken(tokenId: string, request: TestStoredTokenRequest): Promise<TestStoredTokenResponse> {
    if (!tokenId) {
      throw new Error('token_id is required')
    }
    if (!request.repository_url) {
      throw new Error('repository_url is required')
    }
    return this.post<TestStoredTokenResponse>(`/external-tokens/${tokenId}/test`, request)
  }

  // Management Endpoints

  async updateToken(tokenId: string, request: UpdateTokenRequest): Promise<UpdateTokenResponse> {
    if (!tokenId) {
      throw new Error('token_id is required')
    }
    return this.put<UpdateTokenResponse>(`/external-tokens/${tokenId}`, request)
  }

  async revokeToken(tokenId: string): Promise<RevokeTokenResponse> {
    if (!tokenId) {
      throw new Error('token_id is required')
    }
    return this.delete<RevokeTokenResponse>(`/external-tokens/${tokenId}`)
  }

  // Platform Discovery Endpoint

  async getSupportedPlatforms(): Promise<SupportedPlatformsResponse> {
    return this.get<SupportedPlatformsResponse>('/external-tokens/platforms')
  }

  // Private validation methods

  private validateStoreRequest(request: StoreExternalTokenRequest): void {
    if (!request.platform) {
      throw new Error('platform is required')
    }

    if (!request.token) {
      throw new Error('token is required')
    }

    if (!request.token_name) {
      throw new Error('token_name is required')
    }

    if (!request.token_type) {
      throw new Error('token_type is required')
    }

    // Validate platform
    const validPlatforms: Platform[] = ['github', 'gitlab', 'bitbucket']
    if (!validPlatforms.includes(request.platform)) {
      throw new Error(`platform must be one of: ${validPlatforms.join(', ')}`)
    }

    // Validate token format based on platform
    this.validateTokenFormat(request.token, request.platform)

    // Validate repository URL pattern if provided
    if (request.repository_url_pattern) {
      this.validateRepositoryUrlPattern(request.repository_url_pattern, request.platform)
    }

    // Validate expires_at if provided
    if (request.expires_at) {
      const expiresDate = new Date(request.expires_at)
      if (isNaN(expiresDate.getTime())) {
        throw new Error('expires_at must be a valid ISO 8601 date string')
      }
      if (expiresDate <= new Date()) {
        throw new Error('expires_at must be in the future')
      }
    }
  }

  private validateTokenFormat(token: string, platform: Platform): void {
    switch (platform) {
      case 'github':
        if (!token.startsWith('ghp_') && !token.startsWith('gho_') && !token.startsWith('ghu_') && !token.startsWith('ghs_') && !token.startsWith('ghr_')) {
          throw new Error('Invalid GitHub token format. GitHub tokens should start with ghp_, gho_, ghu_, ghs_, or ghr_')
        }
        break
      case 'gitlab':
        if (!token.startsWith('glpat-') && !token.startsWith('grlpat-') && !token.startsWith('gldt-')) {
          throw new Error('Invalid GitLab token format. GitLab tokens should start with glpat-, grlpat-, or gldt-')
        }
        break
      case 'bitbucket':
        if (!token.startsWith('ATBB')) {
          throw new Error('Invalid Bitbucket token format. Bitbucket tokens should start with ATBB')
        }
        break
    }
  }

  private validateRepositoryUrlPattern(pattern: string, platform: Platform): void {
    try {
      new URL(pattern.replace('*', 'test'))
    } catch {
      throw new Error('Invalid repository URL pattern')
    }

    // Check if pattern contains platform-specific domain
    const platformDomains = {
      github: ['github.com'],
      gitlab: ['gitlab.com'],
      bitbucket: ['bitbucket.org']
    }

    const hasValidDomain = platformDomains[platform].some(domain =>
      pattern.includes(domain)
    )

    if (!hasValidDomain) {
      throw new Error(`Repository URL pattern should contain ${platformDomains[platform].join(' or ')} for ${platform}`)
    }
  }
}