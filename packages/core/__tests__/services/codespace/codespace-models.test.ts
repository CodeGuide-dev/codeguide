import { CodespaceService } from '../../../services/codespace/codespace-service'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import axiosMockAdapter from 'axios-mock-adapter'

describe('CodespaceService - Models Endpoints', () => {
  let service: CodespaceService
  let mock: axiosMockAdapter

  beforeEach(() => {
    const config: APIServiceConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
      timeout: 10000,
    }

    service = new CodespaceService(config)
    mock = new axiosMockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  // ============================================================================
  // Get All Codespace Models Tests
  // ============================================================================

  describe('getCodespaceModels', () => {
    it('should get all codespace models without filters', async () => {
      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          created_at: '2024-01-15T11:00:00.000Z',
          key: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider_id: '123e4567-e89b-12d3-a456-426614174001',
          base_url: 'https://api.anthropic.com',
          completion_base_url: null,
          execution_mode: 'claude-code',
          logo_src: 'https://example.com/logos/claude3.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            created_at: '2024-01-10T09:30:00.000Z',
            name: 'Anthropic',
            key: 'anthropic',
            logo_src: 'https://example.com/logos/anthropic.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models').reply(200, expectedResponse)

      const result = await service.getCodespaceModels()

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models')
    })

    it('should get codespace models filtered by provider_id', async () => {
      const query = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000'
      }

      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000').reply(200, expectedResponse)

      const result = await service.getCodespaceModels(query)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000')
    })

    it('should get codespace models filtered by execution_mode', async () => {
      const query = {
        execution_mode: 'opencode'
      }

      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models?execution_mode=opencode').reply(200, expectedResponse)

      const result = await service.getCodespaceModels(query)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models?execution_mode=opencode')
    })

    it('should handle authentication error', async () => {
      const errorResponse = {
        detail: 'Authentication required'
      }

      mock.onGet('/api/codespace-models/models').reply(401, errorResponse)

      await expect(service.getCodespaceModels()).rejects.toThrow()
    })

    it('should handle server error', async () => {
      const errorResponse = {
        detail: 'Failed to fetch codespace models'
      }

      mock.onGet('/api/codespace-models/models').reply(500, errorResponse)

      await expect(service.getCodespaceModels()).rejects.toThrow()
    })
  })

  // ============================================================================
  // Get Specific Codespace Model Tests
  // ============================================================================

  describe('getCodespaceModel', () => {
    it('should get a specific codespace model by ID', async () => {
      const modelId = '123e4567-e89b-12d3-a456-426614174001'
      const expectedResponse = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-15T10:30:00.000Z',
        key: 'gpt-4',
        name: 'GPT-4',
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        base_url: 'https://api.openai.com/v1',
        completion_base_url: 'https://api.openai.com/v1/completions',
        execution_mode: 'opencode',
        logo_src: 'https://example.com/logos/gpt4.png',
        provider: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-10T09:00:00.000Z',
          name: 'OpenAI',
          key: 'openai',
          logo_src: 'https://example.com/logos/openai.png'
        }
      }

      mock.onGet(`/api/codespace-models/models/${modelId}`).reply(200, expectedResponse)

      const result = await service.getCodespaceModel(modelId)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models/123e4567-e89b-12d3-a456-426614174001')
    })

    it('should handle model not found error', async () => {
      const modelId = '123e4567-e89b-12d3-a456-426614174999'
      const errorResponse = {
        detail: 'Codespace model with ID 123e4567-e89b-12d3-a456-426614174999 not found'
      }

      mock.onGet(`/api/codespace-models/models/${modelId}`).reply(404, errorResponse)

      await expect(service.getCodespaceModel(modelId)).rejects.toThrow()
    })

    it('should throw error when model_id is missing', async () => {
      await expect(service.getCodespaceModel('')).rejects.toThrow('model_id is required')
    })
  })

  // ============================================================================
  // Get All LLM Model Providers Tests
  // ============================================================================

  describe('getLLMModelProviders', () => {
    it('should get all LLM model providers', async () => {
      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-10T09:00:00.000Z',
          name: 'OpenAI',
          key: 'openai',
          logo_src: 'https://example.com/logos/openai.png'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-10T09:30:00.000Z',
          name: 'Anthropic',
          key: 'anthropic',
          logo_src: 'https://example.com/logos/anthropic.png'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          created_at: '2024-01-10T10:00:00.000Z',
          name: 'Google',
          key: 'google',
          logo_src: 'https://example.com/logos/google.png'
        }
      ]

      mock.onGet('/api/codespace-models/providers').reply(200, expectedResponse)

      const result = await service.getLLMModelProviders()

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/providers')
    })

    it('should handle empty providers list', async () => {
      const expectedResponse = []

      mock.onGet('/api/codespace-models/providers').reply(200, expectedResponse)

      const result = await service.getLLMModelProviders()

      expect(result).toEqual(expectedResponse)
      expect(result).toHaveLength(0)
    })
  })

  // ============================================================================
  // Get Specific LLM Model Provider Tests
  // ============================================================================

  describe('getLLMModelProvider', () => {
    it('should get a specific LLM model provider by ID', async () => {
      const providerId = '123e4567-e89b-12d3-a456-426614174000'
      const expectedResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-10T09:00:00.000Z',
        name: 'OpenAI',
        key: 'openai',
        logo_src: 'https://example.com/logos/openai.png'
      }

      mock.onGet(`/api/codespace-models/providers/${providerId}`).reply(200, expectedResponse)

      const result = await service.getLLMModelProvider(providerId)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/providers/123e4567-e89b-12d3-a456-426614174000')
    })

    it('should throw error when provider_id is missing', async () => {
      await expect(service.getLLMModelProvider('')).rejects.toThrow('provider_id is required')
    })
  })

  // ============================================================================
  // Get Models by Provider Tests
  // ============================================================================

  describe('getModelsByProvider', () => {
    it('should get models by provider', async () => {
      const providerId = '123e4567-e89b-12d3-a456-426614174000'
      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          created_at: '2024-01-16T14:20:00.000Z',
          key: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt35.png'
        }
      ]

      mock.onGet(`/api/codespace-models/providers/${providerId}/models`).reply(200, expectedResponse)

      const result = await service.getModelsByProvider(providerId)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/providers/123e4567-e89b-12d3-a456-426614174000/models')
    })

    it('should handle empty models list for provider', async () => {
      const providerId = '123e4567-e89b-12d3-a456-426614174999'
      const expectedResponse = []

      mock.onGet(`/api/codespace-models/providers/${providerId}/models`).reply(200, expectedResponse)

      const result = await service.getModelsByProvider(providerId)

      expect(result).toEqual(expectedResponse)
      expect(result).toHaveLength(0)
    })

    it('should throw error when provider_id is missing', async () => {
      await expect(service.getModelsByProvider('')).rejects.toThrow('provider_id is required')
    })
  })

  // ============================================================================
  // Utility Method Tests
  // ============================================================================

  describe('buildQueryParams', () => {
    it('should build query parameters correctly', async () => {
      const query = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        execution_mode: 'opencode'
      }

      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000&execution_mode=opencode').reply(200, expectedResponse)

      const result = await service.getCodespaceModels(query)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000&execution_mode=opencode')
    })

    it('should handle undefined and null values', async () => {
      const query = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        execution_mode: undefined,
        invalid_param: null
      }

      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000').reply(200, expectedResponse)

      const result = await service.getCodespaceModels(query)

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models?provider_id=123e4567-e89b-12d3-a456-426614174000')
    })

    it('should return empty string for no params', async () => {
      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-15T10:30:00.000Z',
          key: 'gpt-4',
          name: 'GPT-4',
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          base_url: 'https://api.openai.com/v1',
          completion_base_url: 'https://api.openai.com/v1/completions',
          execution_mode: 'opencode',
          logo_src: 'https://example.com/logos/gpt4.png',
          provider: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-10T09:00:00.000Z',
            name: 'OpenAI',
            key: 'openai',
            logo_src: 'https://example.com/logos/openai.png'
          }
        }
      ]

      mock.onGet('/api/codespace-models/models').reply(200, expectedResponse)

      const result = await service.getCodespaceModels()

      expect(result).toEqual(expectedResponse)
      expect(mock.history.get[0].url).toBe('/api/codespace-models/models')
    })
  })
})