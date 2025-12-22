/**
 * Request type for streaming a tech-spec
 */
export interface StreamTechSpecRequest {
  project_id: string
}

/**
 * A single chunk from the SSE stream
 */
export interface StreamChunk {
  content: string
  done: boolean
  error?: string
}
