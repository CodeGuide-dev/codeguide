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
export type {
  ConnectRepositoryRequest,
  ConnectRepositoryResponse,
  ProjectRepository,
  GetProjectsRequest,
  PaginatedProjectsRequest,
  PaginatedProjectsResponse,
} from './services/projects/project-types'
export type {
  CreateCodespaceTaskRequestV2 as CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponseV2 as CreateCodespaceTaskResponse,
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  ModelApiKey,
  Attachment,
  GetCodespaceTaskResponse,
  CodespaceTaskData,
  TechnicalDocument,
  GetProjectTasksByCodespaceResponse,
} from './services/codespace/codespace-types'

// Export commonly used external tokens types for convenience
export type {
  StoreExternalTokenRequest,
  StoreExternalTokenResponse,
  ListTokensQuery,
  ListTokensResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  FindBestMatchRequest,
  FindBestMatchResponse,
  Platform,
  TokenType,
} from './services/external-tokens/external-tokens-types'

// Export commonly used starter kits types for convenience
export type {
  StarterKit,
  StarterKitMetadata,
  GetStarterKitsRequest,
  GetStarterKitsResponse,
} from './services/starter-kits/starter-kits-types'
