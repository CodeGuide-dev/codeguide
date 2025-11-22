import { CodespaceService } from '../../../services/codespace/codespace-service'
import {
  CreateCodespaceTaskRequestV2,
  CreateBackgroundCodespaceTaskRequest,
  ModelApiKey,
  GetCodespaceProjectSummaryRequest,
  GetCodespaceProjectSummaryResponse,
} from '../../../services/codespace/codespace-types'
import { APIServiceConfig } from '../../../types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('CodespaceService - V2 Task Endpoints', () => {
  let mockAxios: MockAdapter
  let codespaceService: CodespaceService
  let config: APIServiceConfig

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
    config = {
      baseUrl: 'https://api.example.com',
      databaseApiKey: 'sk_test123',
    }
    codespaceService = new CodespaceService(config)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('createCodespaceTaskV2', () => {
    const validRequest: CreateCodespaceTaskRequestV2 = {
      project_id: 'project-123',
      task_description: 'Create a new authentication system',
      title: 'Auth System Implementation',
      execution_mode: 'implementation',
    }

    it('should create a codespace task successfully', async () => {
      const mockResponse = {
        success: true,
        task_id: 'task-456',
        message: 'Task created successfully',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
      }

      mockAxios.onPost('/codespace/task', validRequest).reply(200, mockResponse)

      const result = await codespaceService.createCodespaceTaskV2(validRequest)

      expect(result).toEqual(mockResponse)
    })

    it('should throw error for missing project_id', async () => {
      const invalidRequest = {
        task_description: 'Create a new feature',
      }

      await expect(codespaceService.createCodespaceTaskV2(invalidRequest as any)).rejects.toThrow(
        'project_id is required'
      )
    })

    it('should throw error for missing task_description', async () => {
      const invalidRequest = {
        project_id: 'project-123',
      }

      await expect(codespaceService.createCodespaceTaskV2(invalidRequest as any)).rejects.toThrow(
        'task_description is required'
      )
    })

    it('should set default base_branch to main', async () => {
      const requestWithoutBaseBranch = {
        project_id: 'project-123',
        task_description: 'Create a feature',
      }

      const mockResponse = {
        success: true,
        task_id: 'task-456',
        message: 'Task created successfully',
      }

      mockAxios
        .onPost(
          '/codespace/task',
          expect.objectContaining({
            base_branch: 'main',
          })
        )
        .reply(200, mockResponse)

      const result = await codespaceService.createCodespaceTaskV2(requestWithoutBaseBranch)

      expect(result).toEqual(mockResponse)
    })

    it('should validate execution_mode', async () => {
      const invalidRequest = {
        project_id: 'project-123',
        task_description: 'Create a feature',
        execution_mode: 'invalid-mode' as any,
      }

      await expect(codespaceService.createCodespaceTaskV2(invalidRequest)).rejects.toThrow(
        'execution_mode must be either "implementation", "docs-only", or "direct"'
      )
    })

    it('should accept valid execution modes', async () => {
      const validModes = ['implementation', 'docs-only', 'direct'] as const

      for (const mode of validModes) {
        const request = {
          project_id: 'project-123',
          task_description: 'Create a feature',
          execution_mode: mode,
        }

        const mockResponse = {
          success: true,
          task_id: 'task-456',
          message: 'Task created successfully',
        }

        mockAxios.onPost('/codespace/task', request).reply(200, mockResponse)

        const result = await codespaceService.createCodespaceTaskV2(request)
        expect(result).toEqual(mockResponse)
      }
    })

    it('should validate model_api_keys structure', async () => {
      const invalidRequest = {
        project_id: 'project-123',
        task_description: 'Create a feature',
        model_api_keys: 'not-an-array' as any,
      }

      await expect(codespaceService.createCodespaceTaskV2(invalidRequest)).rejects.toThrow(
        'model_api_keys must be an array'
      )
    })

    it('should validate individual model_api_key entries', async () => {
      const invalidRequest = {
        project_id: 'project-123',
        task_description: 'Create a feature',
        model_api_keys: [
          { model_name: '', api_key: 'key1' }, // Empty model_name
          { model_name: 'model2', api_key: '' }, // Empty api_key
        ],
      }

      await expect(codespaceService.createCodespaceTaskV2(invalidRequest)).rejects.toThrow(
        'Each model_api_key must have a valid model_name string'
      )
    })

    it('should accept valid model_api_keys', async () => {
      const validModelApiKeys: ModelApiKey[] = [
        { model_name: 'gpt-4', api_key: 'sk-key1' },
        { model_name: 'claude-3', api_key: 'sk-key2' },
      ]

      const request = {
        project_id: 'project-123',
        task_description: 'Create a feature',
        model_api_keys: validModelApiKeys,
      }

      const mockResponse = {
        success: true,
        task_id: 'task-456',
        message: 'Task created successfully',
      }

      mockAxios.onPost('/codespace/task', request).reply(200, mockResponse)

      const result = await codespaceService.createCodespaceTaskV2(request)
      expect(result).toEqual(mockResponse)
    })

    it('should work with all optional fields', async () => {
      const fullRequest: CreateCodespaceTaskRequestV2 = {
        project_id: 'project-123',
        project_repository_id: 'repo-456',
        task_description: 'Create comprehensive feature',
        title: 'Full Feature Implementation',
        branch: 'feature-branch',
        working_branch: 'work-branch',
        base_branch: 'develop',
        docs_url: 'https://docs.example.com',
        model_api_keys: [{ model_name: 'gpt-4', api_key: 'sk-key' }],
        github_token: 'ghp_token123',
        codespace_task_id: 'existing-task-789',
        execution_mode: 'implementation',
        model_name: 'gpt-4',
        starter_kit_repo: 'https://github.com/example/starter-kit',
      }

      const mockResponse = {
        success: true,
        task_id: 'task-456',
        message: 'Task created successfully',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
      }

      mockAxios.onPost('/codespace/task', fullRequest).reply(200, mockResponse)

      const result = await codespaceService.createCodespaceTaskV2(fullRequest)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createBackgroundCodespaceTask', () => {
    const validRequest: CreateBackgroundCodespaceTaskRequest = {
      project_id: 'project-123',
      task_description: 'Create background task',
      execution_mode: 'docs-only',
    }

    it('should create a background codespace task successfully', async () => {
      const mockResponse = {
        success: true,
        task_id: 'bg-task-456',
        message: 'Background task created successfully',
        status: 'queued',
        created_at: '2023-01-01T00:00:00Z',
      }

      mockAxios.onPost('/codespace/task/background', validRequest).reply(200, mockResponse)

      const result = await codespaceService.createBackgroundCodespaceTask(validRequest)

      expect(result).toEqual(mockResponse)
    })

    it('should apply same validation as regular task creation', async () => {
      const invalidRequest = {
        task_description: 'Missing project_id',
      }

      await expect(
        codespaceService.createBackgroundCodespaceTask(invalidRequest as any)
      ).rejects.toThrow('project_id is required')
    })

    it('should work with docs-only mode', async () => {
      const docsOnlyRequest = {
        project_id: 'project-123',
        task_description: 'Generate documentation',
        execution_mode: 'docs-only' as const,
      }

      const mockResponse = {
        success: true,
        task_id: 'docs-task-789',
        message: 'Documentation task created',
        status: 'pending',
      }

      mockAxios.onPost('/codespace/task/background', docsOnlyRequest).reply(200, mockResponse)

      const result = await codespaceService.createBackgroundCodespaceTask(docsOnlyRequest)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCodespaceProjectSummary', () => {
    it('should get project codespace summary successfully', async () => {
      const request: GetCodespaceProjectSummaryRequest = {
        project_id: 'project-123',
      }

      const mockResponse: GetCodespaceProjectSummaryResponse = {
        status: 'success',
        data: {
          project_id: 'project-123',
          total_codespace_tasks: 25,
          status_summary: {
            pending: 5,
            in_progress: 8,
            completed: 10,
            failed: 2,
            blocked: 0,
          },
          latest_task_created_at: '2025-11-16T10:30:00Z',
        },
        message: 'Retrieved summary for 25 codespace tasks in project project-123',
      }

      mockAxios.onGet('/codespace/project/project-123/summary').reply(200, mockResponse)

      const result = await codespaceService.getCodespaceProjectSummary(request)

      expect(result).toEqual(mockResponse)
    })

    it('should throw error when project_id is missing', async () => {
      const invalidRequest = {} as GetCodespaceProjectSummaryRequest

      await expect(
        codespaceService.getCodespaceProjectSummary(invalidRequest)
      ).rejects.toThrow('project_id is required')
    })

    it('should handle API errors properly', async () => {
      const request: GetCodespaceProjectSummaryRequest = {
        project_id: 'project-123',
      }

      mockAxios.onGet('/codespace/project/project-123/summary').reply(404, {
        detail: 'Project not found',
      })

      await expect(codespaceService.getCodespaceProjectSummary(request)).rejects.toThrow()
    })
  })
})
