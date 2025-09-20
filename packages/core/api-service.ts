import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})
import axios, { AxiosInstance } from 'axios'
import { CodeGuideRequest, CodeGuideResponse, APIServiceConfig } from './types'

export class APIService {
  private client: AxiosInstance
  private config: APIServiceConfig

  constructor(config: APIServiceConfig) {
    this.config = config

    // Ensure baseUrl includes the API version
    const baseUrl = config.baseUrl.endsWith('/v1')
      ? config.baseUrl
      : `${config.baseUrl}${config.baseUrl.endsWith('/') ? '' : '/'}v1`

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 3600000, // 1 hour timeout for document generation
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.userId && { 'X-User-ID': config.userId }),
      },
    })
  }

  async getCodeGuide(request: CodeGuideRequest): Promise<CodeGuideResponse> {
    try {
      // Use the appropriate endpoint based on the API documentation
      const response = await this.client.post<CodeGuideResponse>('/generate/refine-prompt', {
        user_prompt: request.prompt,
        ...request,
      })
      return {
        id: response.data.id || Date.now().toString(),
        response: response.data.refined_prompt || response.data.content || 'No response available',
        timestamp: new Date().toISOString(),
        language: request.language,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API Error: ${error.response?.data?.detail || error.response?.data?.message || error.message}`
        )
      }
      throw new Error(`Unknown error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use usage health endpoint from API documentation
      await this.client.get('/usage/health')
      return true
    } catch {
      return false
    }
  }
}
