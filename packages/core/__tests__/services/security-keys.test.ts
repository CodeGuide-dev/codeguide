import { SecurityKeysService } from '../../services/security-keys'
import { APIServiceConfig } from '../../types'
import {
  CreateProviderAPIKeyRequest,
  CreateGitHubTokenRequest
} from '../../services/security-keys/security-keys-types'
import axios from 'axios'
import axiosMockAdapter from 'axios-mock-adapter'

describe('SecurityKeysService', () => {
  let service: SecurityKeysService
  let mock: axiosMockAdapter

  beforeEach(() => {
    const config: APIServiceConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
      timeout: 10000,
    }

    service = new SecurityKeysService(config)
    mock = new axiosMockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  // ============================================================================
  // Provider API Key Tests
  // ============================================================================

  describe('Provider API Key Methods', () => {
    describe('createProviderAPIKey', () => {
      it('should create a provider API key successfully', async () => {
        const request = {
          provider_key: 'openai',
          api_key: 'sk-1234567890abcdef1234567890abcdef12345678'
        }

        const expectedResponse = {
          status: 'success',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            user_id: 'user_abc123',
            name: 'provider_api_key',
            displayed_name: 'OpenAI API Key',
            provider_id: 'openai',
            provider_name: 'OpenAI',
            provider_key: 'openai',
            value_masked: '***************************************5678',
            object_value: {
              provider_id: 'openai'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onPost('/security-keys/provider-api-key', request).reply(201, expectedResponse)

        const result = await service.createProviderAPIKey(request)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.post[0].url).toBe('/security-keys/provider-api-key')
      })

      it('should throw error when provider_key is missing', async () => {
        const request = {
          provider_key: '',
          api_key: 'sk-1234567890abcdef1234567890abcdef12345678'
        } as CreateProviderAPIKeyRequest

        await expect(service.createProviderAPIKey(request)).rejects.toThrow('provider_key is required')
      })

      it('should throw error when api_key is missing', async () => {
        const request = {
          provider_key: 'openai',
          api_key: ''
        } as CreateProviderAPIKeyRequest

        await expect(service.createProviderAPIKey(request)).rejects.toThrow('api_key is required')
      })

      it('should throw error when api_key is too short', async () => {
        const request = {
          provider_key: 'openai',
          api_key: 'short'
        }

        await expect(service.createProviderAPIKey(request)).rejects.toThrow('api_key must be at least 10 characters long')
      })

      it('should handle provider not found error', async () => {
        const request = {
          provider_key: 'invalid_provider',
          api_key: 'sk-1234567890abcdef1234567890abcdef12345678'
        }

        const errorResponse = {
          detail: "Provider 'invalid_provider' not found. Please choose a valid provider."
        }

        mock.onPost('/security-keys/provider-api-key', request).reply(400, errorResponse)

        await expect(service.createProviderAPIKey(request)).rejects.toThrow("Provider 'invalid_provider' not found. Please choose a valid provider.")
      })

      it('should handle duplicate key error', async () => {
        const request = {
          provider_key: 'openai',
          api_key: 'sk-1234567890abcdef1234567890abcdef12345678'
        }

        const errorResponse = {
          detail: "API key for provider 'openai' already exists. Use update endpoint to change it."
        }

        mock.onPost('/security-keys/provider-api-key', request).reply(400, errorResponse)

        await expect(service.createProviderAPIKey(request)).rejects.toThrow("API key for provider 'openai' already exists. Use update endpoint to change it.")
      })
    })

    describe('getProviderAPIKey', () => {
      it('should get a provider API key without revealing it', async () => {
        const providerKey = 'openai'
        const expectedResponse = {
          status: 'success',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            user_id: 'user_abc123',
            name: 'provider_api_key',
            displayed_name: 'OpenAI API Key',
            provider_id: 'openai',
            provider_name: 'OpenAI',
            provider_key: 'openai',
            value_masked: '***************************************5678',
            object_value: {
              provider_id: 'openai'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onGet(`/security-keys/provider-api-key/${providerKey}`).reply(200, expectedResponse)

        const result = await service.getProviderAPIKey(providerKey)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/provider-api-key/openai')
      })

      it('should get a provider API key with reveal=true', async () => {
        const providerKey = 'openai'
        const expectedResponse = {
          status: 'success',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            user_id: 'user_abc123',
            name: 'provider_api_key',
            displayed_name: 'OpenAI API Key',
            provider_id: 'openai',
            provider_name: 'OpenAI',
            provider_key: 'openai',
            value_masked: '***************************************5678',
            value: 'sk-1234567890abcdef1234567890abcdef12345678',
            object_value: {
              provider_id: 'openai'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onGet(`/security-keys/provider-api-key/${providerKey}?reveal=true`).reply(200, expectedResponse)

        const result = await service.getProviderAPIKey(providerKey, true)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/provider-api-key/openai?reveal=true')
      })

      it('should handle key not found error', async () => {
        const providerKey = 'anthropic'
        const errorResponse = {
          detail: "No API key found for provider 'anthropic'"
        }

        mock.onGet(`/security-keys/provider-api-key/${providerKey}`).reply(404, errorResponse)

        await expect(service.getProviderAPIKey(providerKey)).rejects.toThrow("No API key found for provider 'anthropic'")
      })

      it('should throw error when provider_key is missing', async () => {
        await expect(service.getProviderAPIKey('')).rejects.toThrow('provider_key is required')
      })
    })

    describe('listProviderAPIKeys', () => {
      it('should list all provider API keys', async () => {
        const expectedResponse = {
          status: 'success',
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              created_at: '2024-01-15T10:30:00.000Z',
              user_id: 'user_abc123',
              name: 'provider_api_key',
              displayed_name: 'OpenAI API Key',
              provider_id: 'openai',
              provider_name: 'OpenAI',
              provider_key: 'openai',
              provider_logo_src: 'https://cdn.openai.com/API/logo.png',
              value_masked: '***************************************5678',
              object_value: {
                provider_id: 'openai'
              },
              encryption: 'fernet',
              key_version: 'v1'
            },
            {
              id: '456e7890-e89b-12d3-a456-426614174001',
              created_at: '2024-01-15T11:15:00.000Z',
              user_id: 'user_abc123',
              name: 'provider_api_key',
              displayed_name: 'Anthropic API Key',
              provider_id: 'anthropic',
              provider_name: 'Anthropic',
              provider_key: 'anthropic',
              provider_logo_src: 'https://anthropic.com/images/logo.png',
              value_masked: '***************************************9012',
              object_value: {
                provider_id: 'anthropic'
              },
              encryption: 'fernet',
              key_version: 'v1'
            }
          ]
        }

        mock.onGet('/security-keys/provider-api-keys').reply(200, expectedResponse)

        const result = await service.listProviderAPIKeys()

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/provider-api-keys')
      })

      it('should handle empty list response', async () => {
        const expectedResponse = {
          status: 'success',
          data: []
        }

        mock.onGet('/security-keys/provider-api-keys').reply(200, expectedResponse)

        const result = await service.listProviderAPIKeys()

        expect(result).toEqual(expectedResponse)
        expect(result.data).toEqual([])
      })

      it('should list all provider API keys with reveal=true', async () => {
        const expectedResponse = {
          status: 'success',
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              created_at: '2024-01-15T10:30:00.000Z',
              user_id: 'user_123',
              name: 'openai',
              displayed_name: 'OpenAI API Key',
              provider_id: 'provider_123',
              provider_key: 'openai',
              provider_name: 'OpenAI',
              provider_logo_src: 'https://example.com/openai.png',
              object_value: { "provider_id": "provider_123" },
              encryption: 'fernet',
              key_version: 'v1',
              value_masked: 'sk-****CwVP',
              value: 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890CwVP'
            },
            {
              id: null,
              created_at: null,
              user_id: 'user_123',
              name: null,
              displayed_name: null,
              provider_id: 'provider_456',
              provider_key: 'anthropic',
              provider_name: 'Anthropic',
              provider_logo_src: 'https://example.com/anthropic.png',
              object_value: null,
              encryption: null,
              key_version: null,
              value_masked: null,
              value: null
            }
          ]
        }

        mock.onGet('/security-keys/provider-api-keys?reveal=true').reply(200, expectedResponse)

        const result = await service.listProviderAPIKeys(true)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/provider-api-keys?reveal=true')
      })

      describe('revokeProviderAPIKey', () => {
        it('should revoke a provider API key successfully', async () => {
          const providerKey = 'openai'
          const expectedResponse = {
            status: 'success',
            message: 'Provider API key deleted successfully',
            revoked_provider_id: 'openai'
          }

          mock.onDelete(`/security-keys/provider-api-key/${providerKey}`).reply(200, expectedResponse)

          const result = await service.revokeProviderAPIKey(providerKey)

          expect(result).toEqual(expectedResponse)
          expect(mock.history.delete[0].url).toBe('/security-keys/provider-api-key/openai')
        })

        it('should throw error when provider_key is missing', async () => {
          await expect(service.revokeProviderAPIKey('')).rejects.toThrow('provider_key is required')
          await expect(service.revokeProviderAPIKey(null as any)).rejects.toThrow('provider_key is required')
        })

        it('should handle provider API key not found error', async () => {
          const providerKey = 'nonexistent'
          const errorResponse = {
            detail: "No API key found for provider 'nonexistent'"
          }

          mock.onDelete(`/security-keys/provider-api-key/${providerKey}`).reply(404, errorResponse)

          await expect(service.revokeProviderAPIKey(providerKey)).rejects.toThrow("No API key found for provider 'nonexistent'")
        })

        it('should handle provider API key deletion error', async () => {
          const providerKey = 'openai'
          const errorResponse = {
            detail: 'Failed to delete provider API key'
          }

          mock.onDelete(`/security-keys/provider-api-key/${providerKey}`).reply(500, errorResponse)

          await expect(service.revokeProviderAPIKey(providerKey)).rejects.toThrow('Failed to delete provider API key')
        })
      })
    })
  })

  // ============================================================================
  // GitHub Token Tests
  // ============================================================================

  describe('GitHub Token Methods', () => {
    describe('createGitHubToken', () => {
      it('should create a GitHub token successfully', async () => {
        const request = {
          github_token: 'ghp_1234567890abcdef1234567890abcdef12345678'
        }

        const expectedResponse = {
          status: 'success',
          data: {
            id: '789e0123-e89b-12d3-a456-426614174003',
            created_at: '2024-01-15T12:30:00.000Z',
            user_id: 'user_abc123',
            name: 'github_token',
            displayed_name: 'GitHub Token',
            value_masked: '***************************************90ab',
            object_value: {
              token_type: 'personal_access_token'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onPost('/security-keys/github-token', request).reply(201, expectedResponse)

        const result = await service.createGitHubToken(request)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.post[0].url).toBe('/security-keys/github-token')
      })

      it('should throw error when github_token is missing', async () => {
        const request = {} as CreateGitHubTokenRequest

        await expect(service.createGitHubToken(request)).rejects.toThrow('github_token is required')
      })

      it('should throw error when github_token has invalid format', async () => {
        const request = {
          github_token: 'invalid_token'
        }

        await expect(service.createGitHubToken(request)).rejects.toThrow('Invalid GitHub token format. Expected format: ghp_*, gho_*, ghu_*, ghs_*, or ghr_* followed by 36 characters')
      })

      it('should throw error when github_token is too short', async () => {
        const request = {
          github_token: 'ghp_short'
        }

        await expect(service.createGitHubToken(request)).rejects.toThrow('GitHub token must be at least 40 characters long')
      })

      it('should handle GitHub token validation error', async () => {
        const request = {
          github_token: 'ghp_invalid1234567890abcdef1234567890'
        }

        const errorResponse = {
          detail: 'GitHub token validation failed. Please check that the token is valid and has the necessary permissions.'
        }

        mock.onPost('/security-keys/github-token', request).reply(400, errorResponse)

        await expect(service.createGitHubToken(request)).rejects.toThrow('GitHub token validation failed. Please check that the token is valid and has the necessary permissions.')
      })

      it('should handle duplicate GitHub token error', async () => {
        const request = {
          github_token: 'ghp_1234567890abcdef1234567890abcdef12345678'
        }

        const errorResponse = {
          detail: 'GitHub token already exists. Use update endpoint to change it.'
        }

        mock.onPost('/security-keys/github-token', request).reply(400, errorResponse)

        await expect(service.createGitHubToken(request)).rejects.toThrow('GitHub token already exists. Use update endpoint to change it.')
      })
    })

    describe('getGitHubToken', () => {
      it('should get GitHub token without revealing it', async () => {
        const expectedResponse = {
          status: 'success',
          data: {
            id: '789e0123-e89b-12d3-a456-426614174003',
            created_at: '2024-01-15T12:30:00.000Z',
            user_id: 'user_abc123',
            name: 'github_token',
            displayed_name: 'GitHub Token',
            value_masked: '***************************************90ab',
            object_value: {
              token_type: 'personal_access_token'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onGet('/security-keys/github-token').reply(200, expectedResponse)

        const result = await service.getGitHubToken()

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/github-token')
      })

      it('should get GitHub token with reveal=true', async () => {
        const expectedResponse = {
          status: 'success',
          data: {
            id: '789e0123-e89b-12d3-a456-426614174003',
            created_at: '2024-01-15T12:30:00.000Z',
            user_id: 'user_abc123',
            name: 'github_token',
            displayed_name: 'GitHub Token',
            value_masked: '***************************************90ab',
            value: 'ghp_1234567890abcdef1234567890abcdef12345678',
            object_value: {
              token_type: 'personal_access_token'
            },
            encryption: 'fernet',
            key_version: 'v1'
          }
        }

        mock.onGet('/security-keys/github-token?reveal=true').reply(200, expectedResponse)

        const result = await service.getGitHubToken(true)

        expect(result).toEqual(expectedResponse)
        expect(mock.history.get[0].url).toBe('/security-keys/github-token?reveal=true')
      })

      it('should handle GitHub token not found error', async () => {
        const errorResponse = {
          detail: 'No GitHub token found'
        }

        mock.onGet('/security-keys/github-token').reply(404, errorResponse)

        await expect(service.getGitHubToken()).rejects.toThrow('No GitHub token found')
      })

      describe('revokeGitHubToken', () => {
        it('should revoke GitHub token successfully', async () => {
          const expectedResponse = {
            status: 'success',
            message: 'GitHub token deleted successfully',
            revoked_at: '2024-01-15T14:30:00.000Z'
          }

          mock.onDelete('/security-keys/github-token').reply(200, expectedResponse)

          const result = await service.revokeGitHubToken()

          expect(result).toEqual(expectedResponse)
          expect(mock.history.delete[0].url).toBe('/security-keys/github-token')
        })

        it('should handle GitHub token not found error', async () => {
          const errorResponse = {
            detail: 'No GitHub token found'
          }

          mock.onDelete('/security-keys/github-token').reply(404, errorResponse)

          await expect(service.revokeGitHubToken()).rejects.toThrow('No GitHub token found')
        })

        it('should handle GitHub token deletion error', async () => {
          const errorResponse = {
            detail: 'Failed to delete GitHub token'
          }

          mock.onDelete('/security-keys/github-token').reply(500, errorResponse)

          await expect(service.revokeGitHubToken()).rejects.toThrow('Failed to delete GitHub token')
        })
      })
    })
  })

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Validation Tests', () => {
    describe('GitHub Token Validation', () => {
      it('should accept valid GitHub token prefixes', () => {
        const validTokens = [
          'ghp_1234567890abcdef1234567890abcdef12345678',
          'gho_1234567890abcdef1234567890abcdef12345678',
          'ghu_1234567890abcdef1234567890abcdef12345678',
          'ghs_1234567890abcdef1234567890abcdef12345678',
          'ghr_1234567890abcdef1234567890abcdef12345678',
          'github_pat_1234567890abcdef1234567890abcdef12345678'
        ]

        validTokens.forEach(token => {
          expect(() => service['validateGitHubTokenRequest']({ github_token: token })).not.toThrow()
        })
      })

      it('should reject invalid GitHub token prefixes', () => {
        const invalidTokens = [
          'invalid_1234567890abcdef1234567890abcdef12345678',
          'abc_1234567890abcdef1234567890abcdef12345678',
          '1234567890abcdef1234567890abcdef12345678'
        ]

        invalidTokens.forEach(token => {
          expect(() => service['validateGitHubTokenRequest']({ github_token: token })).toThrow('Invalid GitHub token format')
        })
      })
    })
  })
})