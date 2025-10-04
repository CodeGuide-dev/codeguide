import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})

export { CodeGuide } from './codeguide'
export * from './services'
export * from './types'

// Export commonly used types for convenience
export type { ConnectRepositoryRequest, ConnectRepositoryResponse } from './services/projects/project-types'
export type {
  CreateCodespaceTaskRequestV2 as CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponseV2 as CreateCodespaceTaskResponse,
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  ModelApiKey
} from './services/codespace/codespace-types'
