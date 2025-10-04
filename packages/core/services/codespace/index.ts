export { CodespaceService } from './codespace-service'
export * from './codespace-types'

// Re-export commonly used V2 types for convenience
export type {
  CreateCodespaceTaskRequestV2 as CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponseV2 as CreateCodespaceTaskResponse,
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  ModelApiKey
} from './codespace-types'