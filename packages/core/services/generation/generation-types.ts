export interface RefinePromptRequest {
  user_prompt: string
  image_urls?: string[]
  language?: string
  context?: string
}

export interface RefinePromptResponse {
  refined_prompt: string
}

export interface GenerateTitleRequest {
  description: string
  is_deep_research?: boolean
}

export interface GenerateTitleResponse {
  title: string
}

export interface GenerateQuestionnaireRequest {
  project_context: string
}

export interface GenerateQuestionnaireResponse {
  questions: string[]
}

export interface GeneratePRDRequest {
  description: string
  selected_tools: string[]
  answers: Record<string, any>
  outline?: string
}

export interface GeneratePRDResponse {
  content: string
}

export interface GenerateCategoryRequest {
  title: string
  existing_categories?: string[]
}

export interface GenerateCategoryResponse {
  category: string
}

export interface GenerateOutlineRequest {
  project_type: string
  description: string
  selected_tools: string[]
  answers: Record<string, any>
  custom_document_type?: string
  title?: string
  outline?: string
  prd?: string
  app_flow?: string
  tech_stack_doc?: string
  starter_kit?: string
}

export interface GenerateOutlineResponse {
  outline: string
}

export interface GenerateDocumentRequest {
  project_id?: string
  project_type?: string
  description: string
  selected_tools: string[]
  answers: Record<string, any>
  outline?: string
  custom_document_type?: string
  prd?: string
  app_flow?: string
  tech_stack_doc?: string
  title?: string
  starter_kit?: string
}

export interface GenerateDocumentResponse {
  content: string
}

export interface GenerateMultipleDocumentsRequest {
  project_id: string
  description: string
  selected_tools: string[]
  document_types: string[]
  answers: Record<string, any>
  outline?: string
  prd?: string
  app_flow?: string
  tech_stack_doc?: string
  starter_kit?: string
}

export interface GenerateMultipleDocumentsResponse {
  success: boolean
  error?: string
}

export interface BackgroundGenerationRequest {
  project_id: string
  document_types?: string[]
}

export interface BackgroundGenerationResponse {
  job_id: string
  status: string
  message: string
}

export interface BackgroundGenerationStatusResponse {
  job_id: string
  status: string
  progress: Record<string, any>
  results: Record<string, any>
  error?: string
}

export interface GenerateMissingDocumentsRequest {
  project_id: string
}

export interface GenerateMissingDocumentsResponse {
  success: boolean
  message?: string
  error?: string
  generated_documents?: string[]
}

export interface GenerateTechSpecRequest {
  project_id: string
}

export interface CustomDocumentResponse {
  content: string
}

export interface GenerateAnswersRequest {
  title: string
  description: string
  questions: Array<{
    question: string
    answer: string
  }>
}

export interface GenerateAnswersResponse {
  answers: Array<{
    question: string
    answer: string
  }>
}

export type ProjectMode = 'prd_only' | 'full_application' | 'prototype' | 'mvp' | 'wireframe_only'

export interface ProjectOutline {
  core_features: Array<{
    id: number
    title: string
    description: string
    icon_key: string
  }>
  app_flow: Array<{
    id: number
    title: string
    description: string
  }>
  tech_stack: Array<{
    id: number
    type: string
    name: string
    icon_key: string
  }>
  document_types: Array<{
    id: number
    name: string
    description: string
  }>
  is_generated: boolean
  project_mode: ProjectMode
}

export interface GenerateProjectOutlineRequest {
  description: string
  project_type: string
  project_mode?: ProjectMode
  title?: string
  selected_tools?: string[]
  answers?: Record<string, any>
  project_id?: string
  category_id?: string
}

export interface GenerateProjectOutlineResponse {
  project_outline: ProjectOutline
  project_id: string
  project_created: boolean
}

export interface CoreFeature {
  id: number
  title: string
  description: string
  icon_key: string
}

export interface GenerateCoreFeaturesRequest {
  context: string
  project_id?: string
  existing_features?: Array<{
    id: number
    title: string
    description: string
  }>
}

export interface GenerateCoreFeaturesResponse {
  core_features: CoreFeature[]
  project_id: string | null
}

export interface TechStackItem {
  id: number
  type: string
  name: string
  icon_key: string
}

export interface GenerateTechStackRequest {
  context: string
  project_id?: string
  existing_items?: Array<{
    id: number
    type: string
    name: string
  }>
}

export interface GenerateTechStackResponse {
  tech_stack: TechStackItem[]
  project_id: string | null
}

export interface AppFlowItem {
  id: number
  title: string
  page: string
  description: string
  index: number
  icon_key: string
}

export interface GenerateAppFlowRequest {
  context: string
  project_id?: string
  existing_items?: Array<{
    id: number
    title: string
    page: string
    description: string
  }>
}

export interface GenerateAppFlowResponse {
  app_flow: AppFlowItem[]
  project_id: string | null
}
