import { GenerationService } from '../../../services/generation/generation-service'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('GenerationService', () => {
  let mockAxios: MockAdapter
  let generationService: GenerationService
  let config: APIServiceConfig

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    config = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }
    generationService = new GenerationService(config)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('refinePrompt', () => {
    it('should refine prompt successfully', async () => {
      const request = {
        user_prompt: 'How to create a React component?',
        language: 'typescript',
        context: 'CLI testing',
      }

      const response = {
        refined_prompt:
          'To create a React component in TypeScript, you can define a functional component with proper typing...',
        original_prompt: 'How to create a React component?',
      }

      mockAxios.onPost('/v1/generation/refine-prompt', request).reply(200, response)

      const result = await generationService.refinePrompt(request)

      expect(result).toEqual(response)
    })

    it('should handle refine prompt errors', async () => {
      const request = {
        user_prompt: 'Invalid prompt',
      }

      mockAxios.onPost('/v1/generation/refine-prompt', request).reply(400, {
        detail: 'Prompt cannot be empty',
      })

      await expect(generationService.refinePrompt(request)).rejects.toThrow(
        'API Error: Prompt cannot be empty'
      )
    })

    it('should work with minimal request', async () => {
      const request = {
        user_prompt: 'Simple prompt',
      }

      const response = {
        refined_prompt: 'Refined response',
        original_prompt: 'Simple prompt',
      }

      mockAxios.onPost('/v1/generation/refine-prompt', request).reply(200, response)

      const result = await generationService.refinePrompt(request)

      expect(result).toEqual(response)
    })
  })

  describe('generateCode', () => {
    it('should generate code successfully', async () => {
      const request = {
        prompt: 'Create a function to calculate factorial',
        language: 'javascript',
        context: 'Math utility function',
      }

      const response = {
        generated_code:
          'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
        explanation: 'This function calculates the factorial of a number using recursion.',
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/generate-code', request).reply(200, response)

      const result = await generationService.generateCode(request)

      expect(result).toEqual(response)
    })

    it('should handle code generation errors', async () => {
      const request = {
        prompt: 'Create malicious code',
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/generate-code', request).reply(400, {
        detail: 'Request cannot be fulfilled due to safety constraints',
      })

      await expect(generationService.generateCode(request)).rejects.toThrow(
        'API Error: Request cannot be fulfilled due to safety constraints'
      )
    })
  })

  describe('refineCode', () => {
    it('should refine code successfully', async () => {
      const request = {
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        refinement_prompt: 'Add input validation',
        context: 'Utility function',
      }

      const response = {
        refined_code:
          'function add(a, b) {\n  if (typeof a !== "number" || typeof b !== "number") {\n    throw new Error("Both arguments must be numbers");\n  }\n  return a + b;\n}',
        explanation: 'Added type validation to ensure both arguments are numbers.',
        original_code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/refine-code', request).reply(200, response)

      const result = await generationService.refineCode(request)

      expect(result).toEqual(response)
    })

    it('should handle code refinement errors', async () => {
      const request = {
        code: 'invalid code syntax',
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/refine-code', request).reply(400, {
        detail: 'Invalid code syntax',
      })

      await expect(generationService.refineCode(request)).rejects.toThrow(
        'API Error: Invalid code syntax'
      )
    })
  })

  describe('explainCode', () => {
    it('should explain code successfully', async () => {
      const request = {
        code: 'const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);',
        language: 'javascript',
      }

      const response = {
        explanation:
          'This is a recursive arrow function that calculates the factorial of a number.',
        breakdown: [
          {
            line: 1,
            explanation: 'Defines a constant factorial using arrow function syntax',
          },
          {
            line: 1,
            explanation: 'Uses ternary operator for base case (n <= 1) and recursive case',
          },
        ],
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/explain-code', request).reply(200, response)

      const result = await generationService.explainCode(request)

      expect(result).toEqual(response)
    })

    it('should handle code explanation errors', async () => {
      const request = {
        code: 'incomplete code',
        language: 'python',
      }

      mockAxios.onPost('/v1/generation/explain-code', request).reply(400, {
        detail: 'Cannot explain incomplete code',
      })

      await expect(generationService.explainCode(request)).rejects.toThrow(
        'API Error: Cannot explain incomplete code'
      )
    })
  })

  describe('getSuggestions', () => {
    it('should get code suggestions successfully', async () => {
      const request = {
        code: 'function calculateSum(arr) {\n  // TODO: Implement sum calculation\n}',
        language: 'javascript',
        cursor_position: 50,
        context: 'Array processing function',
      }

      const response = {
        suggestions: [
          {
            suggestion: 'return arr.reduce((sum, num) => sum + num, 0);',
            explanation: 'Use reduce method to calculate sum of array elements',
            confidence: 0.95,
          },
          {
            suggestion: 'let sum = 0;\nfor (const num of arr) {\n  sum += num;\n}\nreturn sum;',
            explanation: 'Use traditional for loop for better performance with large arrays',
            confidence: 0.85,
          },
        ],
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/suggestions', request).reply(200, response)

      const result = await generationService.getSuggestions(request)

      expect(result).toEqual(response)
    })

    it('should handle suggestion request errors', async () => {
      const request = {
        code: 'invalid code',
        language: 'javascript',
      }

      mockAxios.onPost('/v1/generation/suggestions', request).reply(400, {
        detail: 'Cannot generate suggestions for invalid code',
      })

      await expect(generationService.getSuggestions(request)).rejects.toThrow(
        'API Error: Cannot generate suggestions for invalid code'
      )
    })
  })

  describe('Authentication Integration', () => {
    it('should use correct authentication headers for all requests', async () => {
      const request = {
        user_prompt: 'Test prompt',
      }

      const response = {
        refined_prompt: 'Test response',
      }

      mockAxios.onPost('/v1/generation/refine-prompt', request).reply(200, response)

      await generationService.refinePrompt(request)

      const mockRequest = mockAxios.history.post[0]
      expect(mockRequest.headers?.Authorization).toBe('Bearer sk_test123')
      expect(mockRequest.headers?.['Content-Type']).toBe('application/json')
    })

    it('should work with different authentication methods', async () => {
      const legacyConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
      }

      const legacyService = new GenerationService(legacyConfig)

      const request = {
        user_prompt: 'Test prompt',
      }

      const response = {
        refined_prompt: 'Test response',
      }

      mockAxios.onPost('/v1/generation/refine-prompt', request).reply(200, response)

      await legacyService.refinePrompt(request)

      const mockRequest = mockAxios.history.post[0]
      expect(mockRequest.headers?.['X-API-Key']).toBe('legacy_key')
      expect(mockRequest.headers?.['X-User-ID']).toBe('user123')
    })
  })
})
