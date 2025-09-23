import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})

export { BaseService } from './base'
export { GenerationService } from './generation'
export { ProjectService } from './projects'
export { UsageService } from './usage'
export { RepositoryAnalysisService } from './repository-analysis'
export { TaskService } from './tasks'
export { ApiKeyEnhancedService } from './api-key-enhanced'
export { SubscriptionService } from './subscriptions'
export { CancellationFunnelService } from './cancellation-funnel'
export { CodespaceService } from './codespace'

// Re-export all types for convenience
export * from './generation'
export * from './projects'
export * from './usage'
export * from './repository-analysis'
export * from './tasks'
export * from './api-key-enhanced'
export * from './subscriptions'
export * from './cancellation-funnel'
export * from './codespace'
