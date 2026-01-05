/**
 * Persona types for prompt generation
 */
export type PersonaType = 'expert' | 'assistant' | 'teacher' | 'analyst' | 'creative'

/**
 * Output format types for generated prompts
 */
export type OutputFormatType = 'markdown' | 'json' | 'xml' | 'plain' | 'code'

/**
 * Request body for creating a new prompt generation
 */
export interface CreatePromptGenerationRequest {
  /** User's description of their AI assistant */
  input: string
  /** Persona type: expert, assistant, teacher, analyst, creative */
  persona?: PersonaType
  /** Format: markdown, json, xml, plain, code */
  output_format?: OutputFormatType
  /** Creativity level (0-2) */
  temperature?: number
  /** Response length (256-8192) */
  max_tokens?: number
  /** Include examples in prompt */
  include_examples?: boolean
  /** Add constraints to prompt */
  include_constraints?: boolean
  /** Include error handling guidance */
  include_error_handling?: boolean
  /** Enable chain of thought */
  chain_of_thought?: boolean
  /** Use JSON output schema */
  structured_output?: boolean
}

/**
 * Prompt generation data model
 */
export interface PromptGeneration {
  /** Unique identifier (UUID v4) */
  id: string
  /** User ID who owns this generation */
  user_id: string
  /** User's original input */
  input: string
  /** Persona type used */
  persona: PersonaType
  /** Output format */
  output_format: OutputFormatType
  /** Temperature value */
  temperature: number
  /** Max tokens setting */
  max_tokens: number
  /** Include examples flag */
  include_examples: boolean
  /** Include constraints flag */
  include_constraints: boolean
  /** Include error handling flag */
  include_error_handling: boolean
  /** Chain of thought flag */
  chain_of_thought: boolean
  /** Structured output flag */
  structured_output: boolean
  /** The generated AI system prompt */
  generated_prompt: string
  /** Creation timestamp (ISO 8601 UTC) */
  created_at: string
}

/**
 * Response for creating a prompt generation
 */
export interface CreatePromptGenerationResponse {
  /** The created prompt generation */
  data: PromptGeneration
}

/**
 * Response for listing prompt generations
 */
export interface ListPromptGenerationsResponse {
  /** Array of prompt generations */
  data: PromptGeneration[]
}

/**
 * Response for getting a single prompt generation
 */
export interface GetPromptGenerationResponse {
  /** The requested prompt generation */
  data: PromptGeneration
}

/**
 * Response for deleting a prompt generation
 */
export interface DeletePromptGenerationResponse {
  /** The deleted prompt generation */
  data: PromptGeneration
}
