import { CodeGuide } from '../codeguide'
import { ConnectRepositoryRequest } from '../services/projects/project-types'
import { APIServiceConfig } from '../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('CodeGuide - Repository Connection Integration', () => {
  let mockAxios: MockAdapter
  let codeGuide: CodeGuide
  let config: APIServiceConfig

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    config = {
      baseUrl: 'https://api.example.com',
      databaseApiKey: 'sk_test123',
    }
    codeGuide = new CodeGuide(config, { verbose: false })
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('projects.connectRepository', () => {
    const projectId = 'project-123'
    const validRequest: ConnectRepositoryRequest = {
      repo_url: 'https://github.com/user/my-app',
      branch: 'main',
      github_token: 'ghp_test123',
    }

    it('should connect repository successfully using projects service', async () => {
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

      const result = await codeGuide.projects.connectRepository(projectId, validRequest)

      expect(result).toEqual(mockResponse)
    })

    it('should work with verbose mode enabled', async () => {
      const verboseCodeGuide = new CodeGuide(config, { verbose: true })

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

      const result = await verboseCodeGuide.projects.connectRepository(projectId, validRequest)

      expect(result).toEqual(mockResponse)
    })

    it('should handle validation errors through projects service', async () => {
      const invalidRequest = {
        repo_url: 'https://gitlab.com/user/repo', // Invalid URL
        branch: 'main',
      }

      await expect(codeGuide.projects.connectRepository(projectId, invalidRequest))
        .rejects.toThrow('Repository URL must be a valid GitHub URL')
    })

    it('should connect public repository without token', async () => {
      const publicRepoRequest = {
        repo_url: 'https://github.com/facebook/react',
        branch: 'main',
      }

      const mockResponse = {
        status: 'success',
        data: {
          id: 'repo-connection-456',
          project_id: projectId,
          repo_url: publicRepoRequest.repo_url,
          branch: publicRepoRequest.branch,
          connection_status: 'connected' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      }

      mockAxios.onPost(`/projects/${projectId}/repository`, publicRepoRequest).reply(200, mockResponse)

      const result = await codeGuide.projects.connectRepository(projectId, publicRepoRequest)

      expect(result).toEqual(mockResponse)
    })
  })
})