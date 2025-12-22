import { BaseService } from '../base/base-service'
import {
  RefinePromptRequest,
  RefinePromptResponse,
  GenerateTitleRequest,
  GenerateTitleResponse,
  GenerateQuestionnaireRequest,
  GenerateQuestionnaireResponse,
  GeneratePRDRequest,
  GeneratePRDResponse,
  GenerateCategoryRequest,
  GenerateCategoryResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  GenerateDocumentRequest,
  GenerateDocumentResponse,
  GenerateMultipleDocumentsRequest,
  GenerateMultipleDocumentsResponse,
  GenerateMissingDocumentsRequest,
  GenerateMissingDocumentsResponse,
  GenerateTechSpecRequest,
  CustomDocumentResponse,
  BackgroundGenerationRequest,
  BackgroundGenerationResponse,
  BackgroundGenerationStatusResponse,
} from './generation-types'

export class GenerationService extends BaseService {
  async refinePrompt(request: RefinePromptRequest): Promise<RefinePromptResponse> {
    return this.post<RefinePromptResponse>('/generate/refine-prompt', request)
  }

  async generateTitle(request: GenerateTitleRequest): Promise<GenerateTitleResponse> {
    return this.post<GenerateTitleResponse>('/generate/title', request)
  }

  async generateQuestionnaire(
    request: GenerateQuestionnaireRequest
  ): Promise<GenerateQuestionnaireResponse> {
    return this.post<GenerateQuestionnaireResponse>('/generate/questionnaire', request)
  }

  async generatePRD(request: GeneratePRDRequest): Promise<GeneratePRDResponse> {
    return this.post<GeneratePRDResponse>('/generate/prd', request)
  }

  async generateCategory(request: GenerateCategoryRequest): Promise<GenerateCategoryResponse> {
    return this.post<GenerateCategoryResponse>('/generate/category', request)
  }

  async generateOutline(request: GenerateOutlineRequest): Promise<GenerateOutlineResponse> {
    return this.post<GenerateOutlineResponse>('/generate/outline', request)
  }

  async generateDocument(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse> {
    return this.post<GenerateDocumentResponse>('/generate/document', request)
  }

  async generateMultipleDocuments(
    request: GenerateMultipleDocumentsRequest
  ): Promise<GenerateMultipleDocumentsResponse> {
    return this.post<GenerateMultipleDocumentsResponse>('/generate/multiple-documents', request)
  }

  async generateMissingDocuments(
    request: GenerateMissingDocumentsRequest
  ): Promise<GenerateMissingDocumentsResponse> {
    return this.post<GenerateMissingDocumentsResponse>(
      '/generate/generate-missing-documents',
      request
    )
  }

  async startBackgroundGeneration(
    request: BackgroundGenerationRequest
  ): Promise<BackgroundGenerationResponse> {
    return this.post<BackgroundGenerationResponse>('/generate/background', request)
  }

  async getBackgroundGenerationStatus(jobId: string): Promise<BackgroundGenerationStatusResponse> {
    return this.get<BackgroundGenerationStatusResponse>(`/generate/background/${jobId}/status`)
  }

  async generateTechSpec(request: GenerateTechSpecRequest): Promise<CustomDocumentResponse> {
    return this.post<CustomDocumentResponse>('/generate/tech-spec', request)
  }
}
