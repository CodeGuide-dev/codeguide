import { CodeGuide } from '../codeguide'
import { APIServiceConfig, CodeGuideOptions } from '../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

// Mock the generation service
jest.mock('../services/generation/generation-service', () => ({
  GenerationService: jest.fn().mockImplementation(() => ({
    refinePrompt: jest.fn(),
  })),
}))

describe('CodeGuide', () => {
  let mockAxios: MockAdapter
  let codeguide: CodeGuide
  let config: APIServiceConfig
  let options: CodeGuideOptions

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    config = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }
    options = {
      language: 'typescript',
      context: 'CLI testing',
      verbose: false,
    }
    codeguide = new CodeGuide(config, options)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('Constructor', () => {
    it('should initialize all services', () => {
      expect(codeguide.generation).toBeDefined()
      expect(codeguide.projects).toBeDefined()
      expect(codeguide.usage).toBeDefined()
      expect(codeguide.repositoryAnalysis).toBeDefined()
      expect(codeguide.tasks).toBeDefined()
    })

    it('should initialize with default options', () => {
      const simpleCodeguide = new CodeGuide(config)
      expect(simpleCodeguide).toBeDefined()
    })
  })

  describe('getGuidance', () => {
    it('should get guidance successfully', async () => {
      const prompt = 'How do I create a React component?'
      const mockResponse = {
        refined_prompt:
          'To create a React component, you can use either functional components with hooks or class components.',
        original_prompt: prompt,
      }

      mockAxios.onPost('/v1/generation/refine-prompt').reply(200, mockResponse)

      const result = await codeguide.getGuidance(prompt)

      expect(result).toEqual({
        id: expect.any(String),
        response: mockResponse.refined_prompt,
        timestamp: expect.any(String),
        language: 'typescript',
      })
    })

    it('should include language in request when provided', async () => {
      const prompt = 'How do I create a React component?'
      const mockResponse = {
        refined_prompt: 'Here is how to create a React component in TypeScript...',
      }

      mockAxios.onPost('/v1/generation/refine-prompt').reply(200, mockResponse)

      await codeguide.getGuidance(prompt)

      const request = mockAxios.history.post[0]
      const requestData = JSON.parse(request.data)

      expect(requestData.language).toBe('typescript')
    })

    it('should include context in request when provided', async () => {
      const prompt = 'How do I create a React component?'
      const mockResponse = {
        refined_prompt: 'Here is how to create a React component...',
      }

      mockAxios.onPost('/v1/generation/refine-prompt').reply(200, mockResponse)

      await codeguide.getGuidance(prompt)

      const request = mockAxios.history.post[0]
      const requestData = JSON.parse(request.data)

      expect(requestData.context).toBe('CLI testing')
    })

    it('should not include optional fields when not provided', async () => {
      const simpleOptions: CodeGuideOptions = {}
      const simpleCodeguide = new CodeGuide(config, simpleOptions)
      const prompt = 'How do I create a React component?'
      const mockResponse = {
        refined_prompt: 'Here is how to create a React component...',
      }

      mockAxios.onPost('/v1/generation/refine-prompt').reply(200, mockResponse)

      await simpleCodeguide.getGuidance(prompt)

      const request = mockAxios.history.post[0]
      const requestData = JSON.parse(request.data)

      expect(requestData).not.toHaveProperty('language')
      expect(requestData).not.toHaveProperty('context')
    })

    it('should handle API errors gracefully', async () => {
      const prompt = 'How do I create a React component?'

      mockAxios.onPost('/v1/generation/refine-prompt').reply(400, {
        detail: 'Invalid prompt format',
      })

      await expect(codeguide.getGuidance(prompt)).rejects.toThrow(
        'API Error: Invalid prompt format'
      )
    })

    it('should log request and response when verbose mode is enabled', async () => {
      const verboseOptions: CodeGuideOptions = {
        verbose: true,
      }
      const verboseCodeguide = new CodeGuide(config, verboseOptions)
      const prompt = 'How do I create a React component?'
      const mockResponse = {
        refined_prompt: 'Here is how to create a React component...',
      }

      // Mock console.log to verify it's called
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      mockAxios.onPost('/v1/generation/refine-prompt').reply(200, mockResponse)

      await verboseCodeguide.getGuidance(prompt)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sending request:',
        expect.stringContaining('user_prompt')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        'Received response:',
        expect.stringContaining('refined_prompt')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('isHealthy', () => {
    it('should return true when API is healthy', async () => {
      mockAxios.onGet('/v1/usage/health').reply(200, {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await codeguide.isHealthy()

      expect(result).toBe(true)
    })

    it('should return false when API is not healthy', async () => {
      mockAxios.onGet('/v1/usage/health').reply(200, {
        status: 'unhealthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      })

      const result = await codeguide.isHealthy()

      expect(result).toBe(false)
    })

    it('should return false when health check fails', async () => {
      mockAxios.onGet('/v1/usage/health').reply(500)

      const result = await codeguide.isHealthy()

      expect(result).toBe(false)
    })
  })

  describe('setOptions', () => {
    it('should update options partially', () => {
      const initialOptions = { ...options }
      expect((codeguide as any).options).toEqual(initialOptions)

      const newOptions: Partial<CodeGuideOptions> = {
        language: 'javascript',
        verbose: true,
      }

      codeguide.setOptions(newOptions)

      expect((codeguide as any).options).toEqual({
        language: 'javascript',
        context: 'CLI testing',
        verbose: true,
      })
    })

    it('should add new options', () => {
      const newOptions: Partial<CodeGuideOptions> = {
        context: 'Updated context',
      }

      codeguide.setOptions(newOptions)

      expect((codeguide as any).options.context).toBe('Updated context')
    })

    it('should handle empty options object', () => {
      const originalOptions = { ...(codeguide as any).options }

      codeguide.setOptions({})

      expect((codeguide as any).options).toEqual(originalOptions)
    })
  })

  describe('Service Access', () => {
    it('should provide access to all services', () => {
      expect(codeguide.generation).toBeDefined()
      expect(codeguide.projects).toBeDefined()
      expect(codeguide.usage).toBeDefined()
      expect(codeguide.repositoryAnalysis).toBeDefined()
      expect(codeguide.tasks).toBeDefined()

      // Verify services are properly configured with the same auth config
      expect((codeguide.generation as any).config).toEqual(config)
      expect((codeguide.projects as any).config).toEqual(config)
      expect((codeguide.usage as any).config).toEqual(config)
      expect((codeguide.repositoryAnalysis as any).config).toEqual(config)
      expect((codeguide.tasks as any).config).toEqual(config)
    })
  })

  describe('Different Authentication Methods', () => {
    it('should work with legacy API key authentication', () => {
      const legacyConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
      }

      const legacyCodeguide = new CodeGuide(legacyConfig, options)

      expect(legacyCodeguide.generation).toBeDefined()
      expect(legacyCodeguide.usage).toBeDefined()
    })

    it('should work with JWT authentication', () => {
      const jwtConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        jwtToken: 'jwt_token',
      }

      const jwtCodeguide = new CodeGuide(jwtConfig, options)

      expect(jwtCodeguide.generation).toBeDefined()
      expect(jwtCodeguide.usage).toBeDefined()
    })

    it('should work with database API key authentication', () => {
      const dbConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
      }

      const dbCodeguide = new CodeGuide(dbConfig, options)

      expect(dbCodeguide.generation).toBeDefined()
      expect(dbCodeguide.usage).toBeDefined()
    })
  })
})
