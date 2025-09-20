import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})
import {
  GenerationService,
  ProjectService,
  UsageService,
  RepositoryAnalysisService,
  TaskService,
  ApiKeyEnhancedService,
  SubscriptionService,
} from './services'
import { APIServiceConfig, CodeGuideOptions } from './types'

export class CodeGuide {
  public generation: GenerationService
  public projects: ProjectService
  public usage: UsageService
  public repositoryAnalysis: RepositoryAnalysisService
  public tasks: TaskService
  public apiKeyEnhanced: ApiKeyEnhancedService
  public subscription: SubscriptionService
  private options: CodeGuideOptions

  constructor(config: APIServiceConfig, options: CodeGuideOptions = {}) {
    this.options = options

    // Initialize all services with the same config
    this.generation = new GenerationService(config)
    this.projects = new ProjectService(config)
    this.usage = new UsageService(config)
    this.repositoryAnalysis = new RepositoryAnalysisService(config)
    this.tasks = new TaskService(config)
    this.apiKeyEnhanced = new ApiKeyEnhancedService(config)
    this.subscription = new SubscriptionService(config)
  }

  // Convenience method for backward compatibility
  async getGuidance(prompt: string): Promise<any> {
    const request = {
      user_prompt: prompt,
      ...(this.options.language && { language: this.options.language }),
      ...(this.options.context && { context: this.options.context }),
    }

    if (this.options.verbose) {
      console.log('Sending request:', JSON.stringify(request, null, 2))
    }

    const response = await this.generation.refinePrompt(request)

    if (this.options.verbose) {
      console.log('Received response:', JSON.stringify(response, null, 2))
    }

    return {
      id: Date.now().toString(),
      response: response.refined_prompt,
      timestamp: new Date().toISOString(),
      language: this.options.language,
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.usage.healthCheck()
  }

  setOptions(options: Partial<CodeGuideOptions>): void {
    this.options = { ...this.options, ...options }
  }
}
