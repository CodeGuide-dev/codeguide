export interface RefinePromptRequest {
  user_prompt: string;
  image_urls?: string[];
  language?: string;
  context?: string;
}

export interface RefinePromptResponse {
  refined_prompt: string;
}

export interface GenerateTitleRequest {
  description: string;
  is_deep_research?: boolean;
}

export interface GenerateTitleResponse {
  title: string;
}

export interface GenerateQuestionnaireRequest {
  project_context: string;
}

export interface GenerateQuestionnaireResponse {
  questions: string[];
}

export interface GeneratePRDRequest {
  description: string;
  selected_tools: string[];
  answers: Record<string, any>;
  outline?: string;
}

export interface GeneratePRDResponse {
  content: string;
}

export interface GenerateCategoryRequest {
  title: string;
  existing_categories?: string[];
}

export interface GenerateCategoryResponse {
  category: string;
}

export interface GenerateOutlineRequest {
  project_type: string;
  description: string;
  selected_tools: string[];
  answers: Record<string, any>;
  custom_document_type?: string;
  title?: string;
  outline?: string;
  prd?: string;
  app_flow?: string;
  tech_stack_doc?: string;
  starter_kit?: string;
}

export interface GenerateOutlineResponse {
  outline: string;
}

export interface GenerateDocumentRequest {
  project_type?: string;
  description: string;
  selected_tools: string[];
  answers: Record<string, any>;
  outline?: string;
  custom_document_type?: string;
  prd?: string;
  app_flow?: string;
  tech_stack_doc?: string;
  title?: string;
  starter_kit?: string;
}

export interface GenerateDocumentResponse {
  content: string;
}

export interface GenerateMultipleDocumentsRequest {
  project_id: string;
  description: string;
  selected_tools: string[];
  document_types: string[];
  answers: Record<string, any>;
  outline?: string;
  prd?: string;
  app_flow?: string;
  tech_stack_doc?: string;
  starter_kit?: string;
}

export interface GenerateMultipleDocumentsResponse {
  success: boolean;
  error?: string;
}

export interface BackgroundGenerationRequest {
  project_id: string;
  document_types?: string[];
}

export interface BackgroundGenerationResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface BackgroundGenerationStatusResponse {
  job_id: string;
  status: string;
  progress: Record<string, any>;
  results: Record<string, any>;
  error?: string;
}
