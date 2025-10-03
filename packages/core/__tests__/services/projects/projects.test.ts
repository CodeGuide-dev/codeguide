import { ProjectService } from '../../../services/projects/project-service'
import { ConnectRepositoryRequest } from '../../../services/projects/project-types'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('ProjectService - Repository Connection', () => {
  let mockAxios: MockAdapter
  let projectService: ProjectService
  let mockConfig: APIServiceConfig

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    mockConfig = {
      baseUrl: 'https://api.example.com',
      databaseApiKey: 'sk_test123',
    }
    projectService = new ProjectService(mockConfig)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('connectRepository', () => {
    const projectId = 'project-123'
    const validRequest: ConnectRepositoryRequest = {
      repo_url: 'https://github.com/user/my-app',
      branch: 'main',
      github_token: 'ghp_test123',
    }

    it('should successfully connect a repository with valid data', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 'repo-connection-123',
          project_id: projectId,
          repo_url: validRequest.repo_url,
          branch: validRequest.branch,
          connection_status: 'connected' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      }

      mockAxios.onPost(`/projects/${projectId}/repository`, validRequest).reply(200, mockResponse)

      const result = await projectService.connectRepository(projectId, validRequest)

      expect(result).toEqual(mockResponse)
    })

    it('should throw error for missing repository URL', async () => {
      const invalidRequest = {
        repo_url: '',
        branch: 'main',
      }

      await expect(projectService.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('Repository URL is required')
    })

    it('should throw error for missing branch name', async () => {
      const invalidRequest = {
        repo_url: 'https://github.com/user/my-app',
        branch: '',
      }

      await expect(projectService.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('Branch name is required')
    })

    it('should throw error for invalid GitHub URL format', async () => {
      const invalidRequest = {
        repo_url: 'https://gitlab.com/user/my-app',
        branch: 'main',
      }

      await expect(projectService.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('Repository URL must be a valid GitHub URL')
    })

    it('should throw error for invalid branch name characters', async () => {
      const invalidRequest = {
        repo_url: 'https://github.com/user/my-app',
        branch: 'main@branch',
      }

      await expect(projectService.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('Branch name contains invalid characters')
    })

    it('should throw error for invalid GitHub token format', async () => {
      const invalidRequest = {
        repo_url: 'https://github.com/user/my-app',
        branch: 'main',
        github_token: 'invalid-token',
      }

      await expect(projectService.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('GitHub token must be a valid personal access token')
    })

    it('should accept valid GitHub token formats', async () => {
      const validTokens = [
        'ghp_test123',
        'gho_test123',
        'ghu_test123',
        'ghs_test123',
        'ghr_test123',
      ]

      for (const token of validTokens) {
        const request = {
          repo_url: 'https://github.com/user/my-app',
          branch: 'main',
          github_token: token,
        }

        const mockResponse = {
          status: 'success',
          data: {
            id: 'repo-connection-123',
            project_id: projectId,
            repo_url: request.repo_url,
            branch: request.branch,
            connection_status: 'connected' as const,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        }

        mockAxios.onPost(`/projects/${projectId}/repository`, request).reply(200, mockResponse)

        const result = await projectService.connectRepository(projectId, request)
        expect(result).toEqual(mockResponse)
      }
    })

    it('should work without GitHub token (for public repos)', async () => {
      const requestWithoutToken = {
        repo_url: 'https://github.com/user/my-app',
        branch: 'main',
      }

      const mockResponse = {
        status: 'success',
        data: {
          id: 'repo-connection-123',
          project_id: projectId,
          repo_url: requestWithoutToken.repo_url,
          branch: requestWithoutToken.branch,
          connection_status: 'connected' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      }

      mockAxios.onPost(`/projects/${projectId}/repository`, requestWithoutToken).reply(200, mockResponse)

      const result = await projectService.connectRepository(projectId, requestWithoutToken)
      expect(result).toEqual(mockResponse)
    })

    it('should accept GitHub URLs with trailing slash', async () => {
      const requestWithTrailingSlash = {
        repo_url: 'https://github.com/user/my-app/',
        branch: 'main',
      }

      const mockResponse = {
        status: 'success',
        data: {
          id: 'repo-connection-123',
          project_id: projectId,
          repo_url: 'https://github.com/user/my-app/',
          branch: 'main',
          connection_status: 'connected' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      }

      mockAxios.onPost(`/projects/${projectId}/repository`, requestWithTrailingSlash).reply(200, mockResponse)

      const result = await projectService.connectRepository(projectId, requestWithTrailingSlash)
      expect(result).toEqual(mockResponse)
    })
  })
})