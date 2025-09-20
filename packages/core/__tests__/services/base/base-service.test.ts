import { TestService } from '../../test-service'
import { APIServiceConfig, AuthenticationMethod } from '../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('BaseService', () => {
  let mockAxios: MockAdapter
  let testService: TestService

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('Authentication Priority', () => {
    it('should prioritize database API key when available', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
        apiKey: 'legacy_key',
        userId: 'user123',
        jwtToken: 'jwt_token',
      }

      testService = new TestService(config)
      const authMethod = testService.testGetAuthenticationMethod()

      expect(authMethod).toEqual({
        type: 'database-api-key',
        priority: 1,
        headers: {
          Authorization: 'Bearer sk_test123',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should use legacy API key + user ID when no database API key', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
        jwtToken: 'jwt_token',
      }

      testService = new TestService(config)
      const authMethod = testService.testGetAuthenticationMethod()

      expect(authMethod).toEqual({
        type: 'legacy-api-key',
        priority: 2,
        headers: {
          'X-API-Key': 'legacy_key',
          'X-User-ID': 'user123',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should use JWT token when no other auth methods available', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        jwtToken: 'jwt_token',
      }

      testService = new TestService(config)
      const authMethod = testService.testGetAuthenticationMethod()

      expect(authMethod).toEqual({
        type: 'clerk-jwt',
        priority: 3,
        headers: {
          Authorization: 'Bearer jwt_token',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should fallback to legacy API key without user ID', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
      }

      testService = new TestService(config)
      const authMethod = testService.testGetAuthenticationMethod()

      expect(authMethod).toEqual({
        type: 'legacy-api-key',
        priority: 2,
        headers: {
          'X-API-Key': 'legacy_key',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should return null when no authentication methods available', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
      }

      testService = new TestService(config)
      const authMethod = testService.testGetAuthenticationMethod()

      expect(authMethod).toBeNull()
    })
  })

  describe('Authentication Validation', () => {
    it('should validate database API key format', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'invalid_key', // Missing sk_ prefix
      }

      testService = new TestService(config)
      const result = testService.testValidateAuthentication()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database API key must start with "sk_"')
    })

    it('should validate legacy API key requires user ID', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        // No userId
      }

      testService = new TestService(config)
      const result = testService.testValidateAuthentication()

      expect(result.success).toBe(true)
      expect(result.method?.type).toBe('legacy-api-key')
    })

    it('should return error when no authentication configured', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
      }

      testService = new TestService(config)
      const result = testService.testValidateAuthentication()

      expect(result.success).toBe(false)
      expect(result.error).toContain('No authentication method configured')
    })

    it('should validate successful database API key authentication', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
      }

      testService = new TestService(config)
      const result = testService.testValidateAuthentication()

      expect(result.success).toBe(true)
      expect(result.method?.type).toBe('database-api-key')
    })
  })

  describe('HTTP Methods', () => {
    const config: APIServiceConfig = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }

    beforeEach(() => {
      testService = new TestService(config)
    })

    it('should make GET requests with authentication headers', async () => {
      const mockResponse = { data: 'test' }
      mockAxios.onGet('/v1/test').reply(200, mockResponse)

      const result = await testService.testGet('/test')

      expect(result).toEqual(mockResponse)
      const request = mockAxios.history.get[0]
      expect(request.headers?.Authorization).toBe('Bearer sk_test123')
      expect(request.headers?.['Content-Type']).toBe('application/json')
    })

    it('should make POST requests with authentication headers', async () => {
      const mockData = { name: 'test' }
      const mockResponse = { id: 1, ...mockData }
      mockAxios.onPost('/v1/test').reply(200, mockResponse)

      const result = await testService.testPost('/test', mockData)

      expect(result).toEqual(mockResponse)
      const request = mockAxios.history.post[0]
      expect(request.headers?.Authorization).toBe('Bearer sk_test123')
      expect(request.headers?.['Content-Type']).toBe('application/json')
      expect(JSON.parse(request.data)).toEqual(mockData)
    })

    it('should make PUT requests with authentication headers', async () => {
      const mockData = { name: 'updated' }
      const mockResponse = { id: 1, ...mockData }
      mockAxios.onPut('/v1/test/1').reply(200, mockResponse)

      const result = await testService.testPut('/test/1', mockData)

      expect(result).toEqual(mockResponse)
      const request = mockAxios.history.put[0]
      expect(request.headers?.Authorization).toBe('Bearer sk_test123')
    })

    it('should make DELETE requests with authentication headers', async () => {
      mockAxios.onDelete('/v1/test/1').reply(204)

      const result = await testService.testDelete('/test/1')

      expect(result).toBeUndefined()
      const request = mockAxios.history.delete[0]
      expect(request.headers?.Authorization).toBe('Bearer sk_test123')
    })
  })

  describe('Error Handling', () => {
    const config: APIServiceConfig = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }

    beforeEach(() => {
      testService = new TestService(config)
    })

    it('should handle 401 authentication errors', async () => {
      mockAxios.onGet('/v1/test').reply(401, { detail: 'Invalid API key' })

      await expect(testService.testGet('/test')).rejects.toThrow(
        'Database API key authentication failed: Invalid API key'
      )
    })

    it('should handle 403 permission errors', async () => {
      mockAxios.onGet('/v1/test').reply(403, { detail: 'Insufficient permissions' })

      await expect(testService.testGet('/test')).rejects.toThrow(
        'Access denied: Insufficient permissions'
      )
    })

    it('should handle 429 rate limiting errors', async () => {
      mockAxios.onGet('/v1/test').reply(429, { detail: 'Too many requests' })

      await expect(testService.testGet('/test')).rejects.toThrow(
        'Rate limit exceeded: Too many requests'
      )
    })

    it('should handle usage limit errors', async () => {
      mockAxios.onGet('/v1/test').reply(402, { detail: 'Insufficient credits' })

      await expect(testService.testGet('/test')).rejects.toThrow(
        'Usage limit exceeded: Insufficient credits'
      )
    })

    it('should handle generic API errors', async () => {
      mockAxios.onGet('/v1/test').reply(500, { message: 'Internal server error' })

      await expect(testService.testGet('/test')).rejects.toThrow('API Error: Internal server error')
    })
  })

  describe('URL Building', () => {
    const config: APIServiceConfig = {
      baseUrl: 'https://api.codeguide.app',
      databaseApiKey: 'sk_test123',
    }

    beforeEach(() => {
      testService = new TestService(config)
    })

    it('should build URL with leading slash', () => {
      const url = testService.testBuildUrl('/test')
      expect(url).toBe('/test')
    })

    it('should build URL without leading slash', () => {
      const url = (baseService as any).buildUrl('test')
      expect(url).toBe('/test')
    })
  })

  describe('Base URL Configuration', () => {
    it('should add /v1 suffix to baseUrl if not present', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
      }

      testService = new TestService(config)

      // Access the internal client to check baseURL
      const client = (testService as any).client
      expect(client.defaults.baseURL).toBe('https://api.codeguide.app/v1')
    })

    it('should not add /v1 suffix if already present', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app/v1',
        databaseApiKey: 'sk_test123',
      }

      testService = new TestService(config)

      const client = (testService as any).client
      expect(client.defaults.baseURL).toBe('https://api.codeguide.app/v1')
    })

    it('should handle baseUrl with trailing slash', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app/',
        databaseApiKey: 'sk_test123',
      }

      testService = new TestService(config)

      const client = (testService as any).client
      expect(client.defaults.baseURL).toBe('https://api.codeguide.app/v1')
    })
  })
})
