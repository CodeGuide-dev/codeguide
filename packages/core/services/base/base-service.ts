import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { APIServiceConfig, AuthenticationMethod, AuthenticationResult } from '../../types'

export abstract class BaseService {
  protected client: AxiosInstance
  protected config: APIServiceConfig

  constructor(config: APIServiceConfig) {
    this.config = config

    // Ensure baseUrl includes the API version
    const baseUrl = config.baseUrl

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 3600000, // 1 hour timeout for document generation
      headers: this.getAuthenticationHeaders(),
    })

    this.setupInterceptors()
  }

  /**
   * Determine and return authentication headers based on priority
   * Priority: 1. Database API Key, 2. Legacy API Key, 3. Clerk JWT
   */
  private getAuthenticationHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Priority 1: Database API Key (format: sk_...)
    if (this.config.databaseApiKey && this.config.databaseApiKey.startsWith('sk_')) {
      headers['Authorization'] = `Bearer ${this.config.databaseApiKey}`
      return headers
    }

    // Priority 2: Legacy API Key + User ID
    if (this.config.apiKey && this.config.userId) {
      headers['X-API-Key'] = this.config.apiKey
      headers['X-User-ID'] = this.config.userId
      return headers
    }

    // Priority 3: Clerk JWT Token
    if (this.config.jwtToken) {
      headers['Authorization'] = `Bearer ${this.config.jwtToken}`
      return headers
    }

    // Fallback: Legacy API key without user ID
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey
      return headers
    }

    return headers
  }

  /**
   * Get the current authentication method being used
   */
  public getAuthenticationMethod(): AuthenticationMethod | null {
    // Priority 1: Database API Key
    if (this.config.databaseApiKey && this.config.databaseApiKey.startsWith('sk_')) {
      return {
        type: 'database-api-key',
        priority: 1,
        headers: {
          Authorization: `Bearer ${this.config.databaseApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    }

    // Priority 2: Legacy API Key + User ID
    if (this.config.apiKey && this.config.userId) {
      return {
        type: 'legacy-api-key',
        priority: 2,
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-User-ID': this.config.userId,
          'Content-Type': 'application/json',
        },
      }
    }

    // Priority 3: Clerk JWT Token
    if (this.config.jwtToken) {
      return {
        type: 'clerk-jwt',
        priority: 3,
        headers: {
          Authorization: `Bearer ${this.config.jwtToken}`,
          'Content-Type': 'application/json',
        },
      }
    }

    // Fallback: Legacy API key without user ID
    if (this.config.apiKey) {
      return {
        type: 'legacy-api-key',
        priority: 2,
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    }

    return null
  }

  /**
   * Validate the current authentication configuration
   */
  public validateAuthentication(): AuthenticationResult {
    const method = this.getAuthenticationMethod()

    if (!method) {
      return {
        success: false,
        error:
          'No authentication method configured. Please provide either databaseApiKey, apiKey + userId, or jwtToken.',
      }
    }

    // Validate database API key format
    if (method.type === 'database-api-key') {
      if (!this.config.databaseApiKey?.startsWith('sk_')) {
        return {
          success: false,
          error: 'Database API key must start with "sk_"',
        }
      }
    }

    // Validate legacy API key requires user ID
    if (method.type === 'legacy-api-key' && !this.config.userId) {
      return {
        success: false,
        error: 'Legacy API key authentication requires both apiKey and userId',
      }
    }

    return {
      success: true,
      method,
    }
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        if (axios.isAxiosError(error)) {
          const authMethod = this.getAuthenticationMethod()
          const status = error.response?.status
          const detail = error.response?.data?.detail
          const message = error.response?.data?.message || error.message

          // Handle authentication-specific errors
          if (status === 401) {
            if (authMethod?.type === 'database-api-key') {
              throw new Error(
                `Database API key authentication failed: ${this.formatErrorMessage(detail, 'Invalid, expired, or inactive API key')}`
              )
            } else if (authMethod?.type === 'legacy-api-key') {
              throw new Error(
                `Legacy API key authentication failed: ${this.formatErrorMessage(detail, 'Invalid API key or user ID')}`
              )
            } else if (authMethod?.type === 'clerk-jwt') {
              throw new Error(
                `Clerk JWT authentication failed: ${this.formatErrorMessage(detail, 'Invalid or expired token')}`
              )
            } else {
              throw new Error(
                `Authentication failed: ${this.formatErrorMessage(detail || message, 'Authentication failed')}`
              )
            }
          }

          // Handle subscription/permission errors
          if (status === 403) {
            throw new Error(
              `Access denied: ${this.formatErrorMessage(detail, 'Insufficient permissions or subscription required')}`
            )
          }

          // Handle rate limiting
          if (status === 429) {
            throw new Error(
              `Rate limit exceeded: ${this.formatErrorMessage(detail, 'Too many requests. Please try again later.')}`
            )
          }

          // Handle usage limit errors
          if (detail?.includes('credits') || detail?.includes('usage')) {
            throw new Error(
              `Usage limit exceeded: ${this.formatErrorMessage(detail, 'Usage limit exceeded')}`
            )
          }

          // Generic API error
          throw new Error(
            `API Error: ${this.formatErrorMessage(detail || message, 'Unknown API error')}`
          )
        }
        throw error
      }
    )
  }

  protected async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  /**
   * Safely format error message to avoid [object Object]
   */
  private formatErrorMessage(value: any, fallback: string): string {
    if (value && typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value || fallback
  }

  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  protected async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  protected buildUrl(endpoint: string): string {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }
}
