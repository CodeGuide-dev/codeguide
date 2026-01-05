import { BaseService } from '../base/base-service'
import {
  CreatePromptGenerationRequest,
  CreatePromptGenerationResponse,
  ListPromptGenerationsResponse,
  GetPromptGenerationResponse,
  DeletePromptGenerationResponse,
} from './prompt-generations-types'

export class PromptGenerationsService extends BaseService {
  /**
   * Create a new AI system prompt generation
   *
   * Generates a new AI system prompt based on user input using GPT-5.1.
   *
   * POST /prompt-generations/
   *
   * @param request - The prompt generation request parameters
   * @returns Promise resolving to the created prompt generation data
   */
  async createPromptGeneration(
    request: CreatePromptGenerationRequest
  ): Promise<CreatePromptGenerationResponse> {
    return this.post<CreatePromptGenerationResponse>('/prompt-generations/', request)
  }

  /**
   * List all prompt generations for the authenticated user
   *
   * Retrieves all prompt generations that belong to the current user.
   *
   * GET /prompt-generations/
   *
   * @returns Promise resolving to an array of prompt generations
   */
  async listPromptGenerations(): Promise<ListPromptGenerationsResponse> {
    return this.get<ListPromptGenerationsResponse>('/prompt-generations/')
  }

  /**
   * Get a specific prompt generation by ID
   *
   * Retrieves detailed information about a single prompt generation.
   *
   * GET /prompt-generations/{generation_id}
   *
   * @param generationId - The UUID of the prompt generation to retrieve
   * @returns Promise resolving to the prompt generation data
   */
  async getPromptGeneration(
    generationId: string
  ): Promise<GetPromptGenerationResponse> {
    return this.get<GetPromptGenerationResponse>(
      `/prompt-generations/${generationId}`
    )
  }

  /**
   * Delete a specific prompt generation by ID
   *
   * Permanently removes a prompt generation from the database.
   *
   * DELETE /prompt-generations/{generation_id}
   *
   * @param generationId - The UUID of the prompt generation to delete
   * @returns Promise resolving to the deleted prompt generation data
   */
  async deletePromptGeneration(
    generationId: string
  ): Promise<DeletePromptGenerationResponse> {
    return this.delete<DeletePromptGenerationResponse>(
      `/prompt-generations/${generationId}`
    )
  }
}
