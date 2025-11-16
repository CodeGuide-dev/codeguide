/**
 * Starter Kit metadata
 */
export interface StarterKitMetadata {
  [key: string]: any
}

/**
 * Starter Kit data structure
 */
export interface StarterKit {
  id: string
  created_at: string
  updated_at: string
  name: string
  repo_name: string | null
  kit_name: string | null
  metadata: StarterKitMetadata | null
  project_structure: string | null
  ordinal: number | null
}

/**
 * Request parameters for getting starter kits
 */
export interface GetStarterKitsRequest {
  name?: string
  repo_name?: string
}

/**
 * Response for getting starter kits
 */
export interface GetStarterKitsResponse {
  status: 'success' | 'error'
  data: StarterKit[]
}

