import { TestService } from './test-service'
import { APIServiceConfig, AuthenticationMethod } from '../types'

describe('Authentication Priority System', () => {
  describe('Priority Order', () => {
    it('should always prefer database API key over other methods', () => {
      const testCases = [
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            databaseApiKey: 'sk_test123',
            apiKey: 'legacy_key',
            userId: 'user123',
            jwtToken: 'jwt_token',
          },
          expectedType: 'database-api-key',
        },
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            databaseApiKey: 'sk_test123',
            jwtToken: 'jwt_token',
          },
          expectedType: 'database-api-key',
        },
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            databaseApiKey: 'sk_test123',
            apiKey: 'legacy_key',
            userId: 'user123',
          },
          expectedType: 'database-api-key',
        },
      ]

      testCases.forEach(({ config, expectedType }) => {
        const service = new TestService(config)
        const authMethod = service.getAuthenticationMethod()
        expect(authMethod?.type).toBe(expectedType)
      })
    })

    it('should prefer legacy API key + user ID over JWT when no database key', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
        jwtToken: 'jwt_token',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.type).toBe('legacy-api-key')
      expect(authMethod?.priority).toBe(2)
    })

    it('should use JWT as fallback when only method available', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        jwtToken: 'jwt_token',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.type).toBe('clerk-jwt')
      expect(authMethod?.priority).toBe(3)
    })
  })

  describe('Header Generation', () => {
    it('should generate correct headers for database API key', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.headers).toEqual({
        Authorization: 'Bearer sk_test123',
        'Content-Type': 'application/json',
      })
    })

    it('should generate correct headers for legacy API key', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.headers).toEqual({
        'X-API-Key': 'legacy_key',
        'X-User-ID': 'user123',
        'Content-Type': 'application/json',
      })
    })

    it('should generate correct headers for JWT token', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        jwtToken: 'jwt_token',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.headers).toEqual({
        Authorization: 'Bearer jwt_token',
        'Content-Type': 'application/json',
      })
    })

    it('should generate headers for legacy API key without user ID', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.headers).toEqual({
        'X-API-Key': 'legacy_key',
        'Content-Type': 'application/json',
      })
    })
  })

  describe('Validation Scenarios', () => {
    it('should reject database API key without sk_ prefix', () => {
      const invalidConfigs = [
        { databaseApiKey: 'test123' },
        { databaseApiKey: 'pk_test123' },
        { databaseApiKey: 'sktest123' },
        { databaseApiKey: '' },
      ]

      invalidConfigs.forEach(config => {
        const fullConfig: APIServiceConfig = {
          baseUrl: 'https://api.codeguide.app',
          ...config,
        }

        const service = new TestService(fullConfig)
        const result = service.validateAuthentication()

        expect(result.success).toBe(false)
        expect(result.error).toContain('must start with "sk_"')
      })
    })

    it('should accept valid database API key formats', () => {
      const validConfigs = ['sk_test123', 'sk_prod_abc123', 'sk_123456789', 'sk_live_xxx']

      validConfigs.forEach(apiKey => {
        const config: APIServiceConfig = {
          baseUrl: 'https://api.codeguide.app',
          databaseApiKey: apiKey,
        }

        const service = new TestService(config)
        const result = service.validateAuthentication()

        expect(result.success).toBe(true)
        expect(result.method?.type).toBe('database-api-key')
      })
    })

    it('should handle mixed authentication configurations', () => {
      const mixedConfigs = [
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            apiKey: 'legacy_key',
            jwtToken: 'jwt_token',
          },
          expectedType: 'legacy-api-key',
        },
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            apiKey: 'legacy_key',
            userId: 'user123',
            databaseApiKey: 'sk_test123',
          },
          expectedType: 'database-api-key',
        },
        {
          config: {
            baseUrl: 'https://api.codeguide.app',
            jwtToken: 'jwt_token',
            databaseApiKey: 'invalid_key',
          },
          expectedType: 'clerk-jwt',
        },
      ]

      mixedConfigs.forEach(({ config, expectedType }) => {
        const service = new TestService(config)
        const result = service.validateAuthentication()

        if (expectedType === 'database-api-key' && config.databaseApiKey === 'invalid_key') {
          expect(result.success).toBe(false)
        } else {
          expect(result.success).toBe(true)
          expect(result.method?.type).toBe(expectedType)
        }
      })
    })
  })

  describe('Priority Consistency', () => {
    it('should maintain consistent priority numbers', () => {
      const config: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        databaseApiKey: 'sk_test123',
        apiKey: 'legacy_key',
        userId: 'user123',
        jwtToken: 'jwt_token',
      }

      const service = new TestService(config)
      const authMethod = service.getAuthenticationMethod()

      expect(authMethod?.priority).toBe(1)

      // Test other methods
      const noDbConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        apiKey: 'legacy_key',
        userId: 'user123',
        jwtToken: 'jwt_token',
      }

      const noDbService = new BaseService(noDbConfig)
      const noDbAuthMethod = noDbService.getAuthenticationMethod()

      expect(noDbAuthMethod?.priority).toBe(2)

      const jwtOnlyConfig: APIServiceConfig = {
        baseUrl: 'https://api.codeguide.app',
        jwtToken: 'jwt_token',
      }

      const jwtOnlyService = new BaseService(jwtOnlyConfig)
      const jwtOnlyAuthMethod = jwtOnlyService.getAuthenticationMethod()

      expect(jwtOnlyAuthMethod?.priority).toBe(3)
    })
  })
})
