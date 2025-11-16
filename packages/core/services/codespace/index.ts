export { CodespaceService } from './codespace-service'
export * from './codespace-types'

// Re-export commonly used V2 types for convenience
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
  CodespaceProjectTask,
  CodespaceProjectTaskListResponse,
  CodespaceQuestionnaireRequest,
  CodespaceQuestionnaireResponse,
  // Codespace Models Types
  LLMModelProviderInDB,
  CodespaceModelInDB,
  CodespaceModelWithProvider,
  GetCodespaceModelsQuery,
  GetCodespaceModelsResponse,
  GetCodespaceModelResponse,
  GetLLMModelProvidersResponse,
  GetLLMModelProviderResponse,
  GetModelsByProviderResponse,
  CodespaceModelsError,
  // Final Report Popup State Types
  UpdateFinalReportPopupStateRequest,
  UpdateFinalReportPopupStateResponse,
  // Codespace Task Logs Types
  GetCodespaceTaskLogsRequest,
  CodespaceTaskLogsResponse,
  StreamCodespaceTaskLogsRequest,
  CodespaceTaskLog,
  CodespaceLogType,
  CodespaceLogStreamEvent,
  // GET /tasks/by-codespace-id Types
  GetTasksByCodespaceIdRequest,
  GetTasksByCodespaceIdResponse
} from './codespace-types'