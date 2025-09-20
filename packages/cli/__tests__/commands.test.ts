import { Command } from 'commander'
import { createCommands } from '../commands'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as fs from 'fs'
import * as path from 'path'

// Mock the CodeGuide class
jest.mock('@codeguide/core', () => ({
  CodeGuide: jest.fn(),
}))

const { CodeGuide } = require('@codeguide/core')

// Mock directory utilities
jest.mock('../utils/directory-utils', () => ({
  getCurrentDirectory: jest.fn(),
  isRootDirectory: jest.fn(),
  getProjectInfo: jest.fn(),
  generateProjectDescription: jest.fn(),
  validateDirectory: jest.fn(),
}))

// Mock fs
jest.mock('fs')

// Mock auth storage
jest.mock('../utils/auth-storage', () => ({
  authStorage: {
    getAuthConfig: jest.fn(),
    saveAuthConfig: jest.fn(),
    clearAuthConfig: jest.fn(),
    hasAuthConfig: jest.fn(),
    getAuthMethod: jest.fn(),
    getAuthInfo: jest.fn(),
  },
}))

const {
  getCurrentDirectory,
  isRootDirectory,
  getProjectInfo,
  generateProjectDescription,
  validateDirectory,
} = require('../utils/directory-utils')

const { authStorage } = require('../utils/auth-storage')

describe('CLI Commands', () => {
  let mockAxios: MockAdapter
  let program: Command
  let mockCodeGuideInstance: any
  let mockFs: jest.Mocked<typeof fs>

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)

    // Reset all mocks
    jest.clearAllMocks()

    // Store and clean environment variables
    ;(global as any).originalEnv = { ...process.env }
    delete process.env.CODEGUIDE_API_URL
    delete process.env.CODEGUIDE_API_KEY

    // Create a mock instance of CodeGuide
    mockCodeGuideInstance = {
      getGuidance: jest.fn(),
      isHealthy: jest.fn(),
      generation: {} as any,
      projects: {} as any,
      usage: {} as any,
      repositoryAnalysis: {} as any,
      tasks: {} as any,
      setOptions: jest.fn(),
    } as any

    // Mock the constructor to return our mock instance
    ;(CodeGuide as jest.Mock).mockImplementation(() => mockCodeGuideInstance)

    // Mock directory utilities
    getCurrentDirectory.mockReturnValue('/test/project')
    isRootDirectory.mockReturnValue(false)
    validateDirectory.mockReturnValue({ valid: true })
    getProjectInfo.mockReturnValue({
      name: 'test-project',
      type: 'node',
      language: 'typescript',
      hasPackageJson: true,
      hasReadme: false,
      mainFiles: ['index.ts', 'app.ts'],
      dependencies: ['express', 'typescript'],
      devDependencies: ['jest', '@types/node'],
    })
    generateProjectDescription.mockReturnValue('Test project description')

    // Setup fs mocks
    const mockedFs = jest.mocked(fs)
    mockedFs.writeFileSync.mockImplementation()
    mockedFs.existsSync.mockReturnValue(false)

    // Setup auth storage mocks
    authStorage.getAuthConfig.mockReturnValue({})
    authStorage.hasAuthConfig.mockReturnValue(false)

    // Create a new program instance for each test
    program = new Command()
    createCommands(program)
  })

  afterEach(() => {
    mockAxios.restore()
    jest.restoreAllMocks()

    // Restore environment variables
    if ((global as any).originalEnv) {
      process.env = (global as any).originalEnv
    }
  })

  describe('generate command', () => {
    it('should generate documentation for current project', async () => {
      const mockResponse = {
        id: '123',
        response: '# Generated Documentation\n\nThis is the generated documentation.',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--api-key', 'sk_test123'])

      expect(validateDirectory).toHaveBeenCalledWith('/test/project')
      expect(isRootDirectory).toHaveBeenCalledWith('/test/project')
      expect(getProjectInfo).toHaveBeenCalledWith('/test/project')

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://api.codeguide.dev',
          databaseApiKey: 'sk_test123',
        },
        {
          language: 'typescript',
          context: 'Test project description',
          verbose: undefined,
        }
      )

      expect(mockCodeGuideInstance.isHealthy).toHaveBeenCalled()
      expect(mockCodeGuideInstance.getGuidance).toHaveBeenCalledWith(
        expect.stringContaining('Generate comprehensive documentation for a node project')
      )
      expect(consoleSpy).toHaveBeenCalledWith('📄 Generating documentation for current project...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Documentation generated successfully!')
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/README.md')

      consoleSpy.mockRestore()
    })

    it('should handle custom output file', async () => {
      const mockResponse = {
        id: '123',
        response: '# Custom Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '-o',
        'CUSTOM.md',
        '--api-key',
        'sk_test123',
      ])

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/CUSTOM.md',
        '# Custom Documentation'
      )
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/CUSTOM.md')

      consoleSpy.mockRestore()
    })

    it('should handle verbose output', async () => {
      const mockResponse = {
        id: '123',
        response: '# Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--verbose', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('Project Analysis:')
      expect(consoleSpy).toHaveBeenCalledWith('Test project description')
      expect(consoleSpy).toHaveBeenCalledWith('---')

      consoleSpy.mockRestore()
    })

    it('should prevent generation in root directory', async () => {
      isRootDirectory.mockReturnValue(true)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error: Cannot generate documentation for root directory'
      )
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle invalid directory', async () => {
      validateDirectory.mockReturnValue({ valid: false, error: 'Directory does not exist' })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Directory does not exist')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })
  })

  describe('generate command with --prompt option', () => {
    it('should generate documentation based on custom prompt', async () => {
      const mockResponse = {
        id: '123',
        response: '# Custom API Documentation\n\nAPI endpoints and usage.',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--prompt',
        'Create API documentation for user authentication',
        '--api-key',
        'sk_test123',
      ])

      expect(validateDirectory).toHaveBeenCalledWith('/test/project')

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://api.codeguide.dev',
          databaseApiKey: 'sk_test123',
        },
        {
          language: 'typescript',
          context: 'Test project description',
          verbose: undefined,
        }
      )

      expect(mockCodeGuideInstance.isHealthy).toHaveBeenCalled()
      expect(mockCodeGuideInstance.getGuidance).toHaveBeenCalledWith(
        expect.stringContaining(
          'Generate comprehensive documentation based on the following request'
        )
      )
      expect(mockCodeGuideInstance.getGuidance).toHaveBeenCalledWith(
        expect.stringContaining('User Request: Create API documentation for user authentication')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        '📄 Generating documentation based on your custom prompt...'
      )
      expect(consoleSpy).toHaveBeenCalledWith('✅ Custom documentation generated successfully!')
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/README.md')

      consoleSpy.mockRestore()
    })

    it('should handle custom output file and language with --prompt option', async () => {
      const mockResponse = {
        id: '123',
        response: '# Python Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--prompt',
        'Create Python setup guide',
        '--language',
        'python',
        '--output',
        'SETUP.md',
        '--api-key',
        'sk_test123',
      ])

      expect(CodeGuide).toHaveBeenCalledWith(expect.any(Object), {
        language: 'python',
        context: 'Test project description',
        verbose: undefined,
      })

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/SETUP.md',
        '# Python Documentation'
      )
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/SETUP.md')

      consoleSpy.mockRestore()
    })

    it('should use default README.md output when using --prompt without custom output', async () => {
      const mockResponse = {
        id: '123',
        response: '# Custom Prompt Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--prompt',
        'Create custom documentation',
        '--api-key',
        'sk_test123',
      ])

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/README.md',
        '# Custom Prompt Documentation'
      )
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/README.md')

      consoleSpy.mockRestore()
    })

    it('should handle both --prompt and --verbose options together', async () => {
      const mockResponse = {
        id: '123',
        response: '# Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--prompt',
        'Create custom docs',
        '--verbose',
        '--api-key',
        'sk_test123',
      ])

      expect(consoleSpy).toHaveBeenCalledWith(
        '📄 Generating documentation based on your custom prompt...'
      )
      expect(consoleSpy).toHaveBeenCalledWith('✅ Custom documentation generated successfully!')
      expect(consoleSpy).toHaveBeenCalledWith('📁 Output file: /test/project/README.md')

      consoleSpy.mockRestore()
    })
  })

  describe('health command', () => {
    it('should display success message when API is healthy', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'health'])

      expect(CodeGuide).toHaveBeenCalledWith({
        baseUrl: 'https://api.codeguide.dev',
        databaseApiKey: undefined,
      })

      expect(mockCodeGuideInstance.isHealthy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('✅ API is healthy')

      consoleSpy.mockRestore()
    })

    it('should display error message when API is not healthy', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(false)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'health'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ API is not healthy')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle authentication methods in health command', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'health',
        '--api-key',
        'sk_test123',
        '--api-url',
        'https://custom.api.com',
      ])

      expect(CodeGuide).toHaveBeenCalledWith({
        baseUrl: 'https://custom.api.com',
        databaseApiKey: 'sk_test123',
      })

      consoleSpy.mockRestore()
    })

    it('should handle health check errors', async () => {
      mockCodeGuideInstance.isHealthy.mockRejectedValue(new Error('Connection failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'health'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error:')
      expect(consoleSpy).toHaveBeenCalledWith('   Context: Failed to check API health')
      expect(consoleSpy).toHaveBeenCalledWith('   Message: Connection failed')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })
  })

  describe('Environment Variables', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
      // Restore the original program with mocked CodeGuide
      program = new Command()
      createCommands(program)
    })

    it('should use environment variables as defaults', async () => {
      process.env.CODEGUIDE_API_URL = 'https://env.api.com'
      process.env.CODEGUIDE_API_KEY = 'sk_env_key'

      // Recreate commands to pick up new environment variables
      program = new Command()
      createCommands(program)

      const mockResponse = {
        id: '123',
        response: 'Test response',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate'])

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://env.api.com',
          databaseApiKey: 'sk_env_key',
        },
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })

    it('should prioritize command line options over environment variables', async () => {
      process.env.CODEGUIDE_API_URL = 'https://env.api.com'
      process.env.CODEGUIDE_API_KEY = 'sk_env_key'

      program = new Command()
      createCommands(program)

      const mockResponse = {
        id: '123',
        response: 'Test response',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--api-url',
        'https://cli.api.com',
        '--api-key',
        'sk_cli_key',
      ])

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://cli.api.com',
          databaseApiKey: 'sk_cli_key',
          apiKey: undefined,
          jwtToken: undefined,
          userId: undefined,
        },
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle unhealthy API service in generate command', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(false)

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--api-key', 'sk_test123'])

      expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Checking authentication...')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error: Authentication failed or API service is not available'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('💡 Please login again with a valid API key:')
      expect(consoleErrorSpy).toHaveBeenCalledWith('   codeguide login')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleLogSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle API errors in generate command', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockRejectedValue(new Error('API Error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error:')
      expect(consoleSpy).toHaveBeenCalledWith('   Context: Failed to generate documentation')
      expect(consoleSpy).toHaveBeenCalledWith('   Message: API Error')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle unhealthy API service in generate command with --prompt option', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(false)

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--prompt',
        'Test prompt',
        '--api-key',
        'sk_test123',
      ])

      expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Checking authentication...')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error: Authentication failed or API service is not available'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('💡 Please login again with a valid API key:')
      expect(consoleErrorSpy).toHaveBeenCalledWith('   codeguide login')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleLogSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      processSpy.mockRestore()
    })
  })

  describe('Authentication Commands', () => {
    beforeEach(() => {
      // Reset auth storage mocks
      authStorage.getAuthConfig.mockReturnValue({})
      authStorage.hasAuthConfig.mockReturnValue(false)
      authStorage.saveAuthConfig.mockImplementation()
      authStorage.clearAuthConfig.mockImplementation()
      authStorage.getAuthInfo.mockReturnValue('')
      authStorage.getAuthMethod.mockReturnValue('None')
    })

    describe('login command', () => {
      it('should save API key successfully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        // Mock environment variable instead of interactive input
        const originalEnvKey = process.env.CODEGUIDE_API_KEY
        process.env.CODEGUIDE_API_KEY = 'sk_test123'

        await program.parseAsync(['node', 'test', 'login'])

        expect(authStorage.saveAuthConfig).toHaveBeenCalledWith({
          apiKey: 'sk_test123',
          apiUrl: 'https://api.codeguide.dev',
        })
        expect(consoleSpy).toHaveBeenCalledWith('📋 Using API key from environment variable')
        expect(consoleSpy).toHaveBeenCalledWith('✅ API key saved successfully!')

        // Restore environment
        process.env.CODEGUIDE_API_KEY = originalEnvKey
        consoleSpy.mockRestore()
      })

      it('should use API key from environment variable when available', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
        const originalEnvKey = process.env.CODEGUIDE_API_KEY

        // Set environment variable
        process.env.CODEGUIDE_API_KEY = 'sk_env_key_123'

        await program.parseAsync(['node', 'test', 'login'])

        expect(authStorage.saveAuthConfig).toHaveBeenCalledWith({
          apiKey: 'sk_env_key_123',
          apiUrl: 'https://api.codeguide.dev',
        })
        expect(consoleSpy).toHaveBeenCalledWith('📋 Using API key from environment variable')

        // Restore environment
        process.env.CODEGUIDE_API_KEY = originalEnvKey
        consoleSpy.mockRestore()
      })

      it('should handle empty API key input', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
        const processSpy = jest.spyOn(process, 'exit').mockImplementation()

        // Mock environment variable with empty string
        const originalEnvKey = process.env.CODEGUIDE_API_KEY
        process.env.CODEGUIDE_API_KEY = ''

        // Mock readline to simulate user entering empty string
        const mockRl = {
          question: jest.fn(),
          close: jest.fn(),
        }
        const readline = require('readline')
        const originalCreateInterface = readline.createInterface
        readline.createInterface = jest.fn().mockReturnValue(mockRl)

        // Mock the question method to resolve with empty string
        mockRl.question.mockImplementation(
          (question: string, callback: (answer: string) => void) => {
            callback('')
          }
        )

        await program.parseAsync(['node', 'test', 'login'])

        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error: API key is required')
        expect(processSpy).toHaveBeenCalledWith(1)

        // Restore environment and readline
        process.env.CODEGUIDE_API_KEY = originalEnvKey
        readline.createInterface = originalCreateInterface
        consoleSpy.mockRestore()
        consoleErrorSpy.mockRestore()
        processSpy.mockRestore()
      })
    })

    describe('logout command', () => {
      it('should remove credentials when they exist', async () => {
        authStorage.hasAuthConfig.mockReturnValue(true)
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        await program.parseAsync(['node', 'test', 'logout'])

        expect(authStorage.clearAuthConfig).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith('✅ API key removed successfully')

        consoleSpy.mockRestore()
      })

      it('should show message when no credentials exist', async () => {
        authStorage.hasAuthConfig.mockReturnValue(false)
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        await program.parseAsync(['node', 'test', 'logout'])

        expect(authStorage.clearAuthConfig).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith('No API key to remove')

        consoleSpy.mockRestore()
      })
    })

    describe('auth command', () => {
      it('should show locked status when credentials exist', async () => {
        authStorage.hasAuthConfig.mockReturnValue(true)
        authStorage.getAuthInfo.mockReturnValue('Test auth info')
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        await program.parseAsync(['node', 'test', 'auth', 'status'])

        expect(consoleSpy).toHaveBeenCalledWith('🔒 API Key Status:')
        expect(consoleSpy).toHaveBeenCalledWith('Test auth info')

        consoleSpy.mockRestore()
      })

      it('should show unlocked status when no credentials exist', async () => {
        authStorage.hasAuthConfig.mockReturnValue(false)
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        await program.parseAsync(['node', 'test', 'auth', 'status'])

        expect(consoleSpy).toHaveBeenCalledWith('🔓 No API key configured')
        expect(consoleSpy).toHaveBeenCalledWith('💡 Use "codeguide login" to save your API key')

        consoleSpy.mockRestore()
      })

      it('should handle invalid auth action', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        const processSpy = jest.spyOn(process, 'exit').mockImplementation()

        await program.parseAsync(['node', 'test', 'auth', 'invalid'])

        expect(consoleSpy).toHaveBeenCalledWith('Error: Invalid action. Use "status" or "show"')
        expect(processSpy).toHaveBeenCalledWith(1)

        consoleSpy.mockRestore()
        processSpy.mockRestore()
      })
    })
  })

  describe('Saved Authentication Usage', () => {
    it('should use saved database API key in generate command', async () => {
      const mockResponse = {
        id: '123',
        response: '# Generated Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      // Setup saved credentials FIRST
      authStorage.getAuthConfig.mockReturnValue({
        apiKey: 'sk_saved_key',
        apiUrl: 'https://saved.api.com',
      })

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'generate'])

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://api.codeguide.dev',
          databaseApiKey: 'sk_saved_key',
        },
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })

    it('should prioritize command line options over saved credentials', async () => {
      const mockResponse = {
        id: '123',
        response: '# Generated Documentation',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.getGuidance.mockResolvedValue(mockResponse)

      // Setup saved credentials
      authStorage.getAuthConfig.mockReturnValue({
        apiKey: 'sk_saved_key',
        apiUrl: 'https://saved.api.com',
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'generate',
        '--api-key',
        'sk_cli_key',
        '--api-url',
        'https://cli.api.com',
      ])

      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://cli.api.com',
          databaseApiKey: 'sk_cli_key',
        },
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('start command', () => {
    beforeEach(() => {
      // Reset mocks for start command tests
      mockCodeGuideInstance.generation = {
        generateTitle: jest.fn(),
        generateOutline: jest.fn(),
        generateMultipleDocuments: jest.fn(),
        generateMissingDocuments: jest.fn(),
      }
      mockCodeGuideInstance.projects = {
        createProject: jest.fn(),
        getProjectDocuments: jest.fn(),
      }
      mockCodeGuideInstance.tasks = {
        generateTasks: jest.fn(),
      }
    })

    it('should create a new project with generated documentation', async () => {
      const mockTitleResponse = { title: 'User Authentication System' }
      const mockOutlineResponse = {
        outline: '1. Introduction\n2. API Endpoints\n3. Database Schema',
      }
      const mockDocResponse = { success: true }
      const mockProject = { id: 'proj_123', title: 'User Authentication System' }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.generation.generateTitle.mockResolvedValue(mockTitleResponse)
      mockCodeGuideInstance.generation.generateOutline.mockResolvedValue(mockOutlineResponse)
      mockCodeGuideInstance.generation.generateMultipleDocuments.mockResolvedValue(mockDocResponse)
      mockCodeGuideInstance.generation.generateMissingDocuments.mockResolvedValue({ data: [] })
      mockCodeGuideInstance.projects.createProject.mockResolvedValue(mockProject)
      mockCodeGuideInstance.tasks.generateTasks.mockResolvedValue({
        status: 'success',
        data: { task_groups_created: 1, tasks_created: 3 },
      })
      mockCodeGuideInstance.projects.getProjectDocuments.mockResolvedValue({ data: [] })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'start',
        'Create a user authentication system with JWT tokens',
        '--api-key',
        'sk_test123',
      ])

      expect(validateDirectory).toHaveBeenCalledWith('/test/project')

      // Check title generation
      expect(mockCodeGuideInstance.generation.generateTitle).toHaveBeenCalledWith({
        description: 'Create a user authentication system with JWT tokens',
      })

      // Check outline generation
      expect(mockCodeGuideInstance.generation.generateOutline).toHaveBeenCalledWith({
        project_type: 'general',
        description: 'Create a user authentication system with JWT tokens',
        title: 'User Authentication System',
      })

      // Check project creation
      expect(mockCodeGuideInstance.projects.createProject).toHaveBeenCalledWith({
        title: 'User Authentication System',
        description: 'Create a user authentication system with JWT tokens',
        outline: '1. Introduction\n2. API Endpoints\n3. Database Schema',
        status: 'active',
      })

      // Check documentation generation
      expect(mockCodeGuideInstance.generation.generateMultipleDocuments).toHaveBeenCalledWith({
        project_id: 'proj_123',
        description: 'Create a user authentication system with JWT tokens',
        selected_tools: [],
        document_types: ['README', 'API_DOCS', 'TECH_SPEC', 'SETUP_GUIDE'],
        answers: {},
        outline: '1. Introduction\n2. API Endpoints\n3. Database Schema',
      })

      expect(consoleSpy).toHaveBeenCalledWith('🚀 Starting new project creation...')
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 Prompt:',
        'Create a user authentication system with JWT tokens'
      )
      expect(consoleSpy).toHaveBeenCalledWith('✅ Project Title:', 'User Authentication System')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Project outline generated')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Project created successfully')
      expect(consoleSpy).toHaveBeenCalledWith('   Project ID:', 'proj_123')
      expect(consoleSpy).toHaveBeenCalledWith('📄 Generating comprehensive documentation...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Multiple documents generated successfully!')
      expect(consoleSpy).toHaveBeenCalledWith(
        '📁 Summary file: ' + path.join('/test/project', 'README.md')
      )
      expect(consoleSpy).toHaveBeenCalledWith('🆔 Project ID: proj_123')
      expect(consoleSpy).toHaveBeenCalledWith('🎉 New project setup complete!')
      expect(consoleSpy).toHaveBeenCalledWith(
        '💡 Additional documents have been generated and associated with your project.'
      )

      consoleSpy.mockRestore()
    })

    it('should handle API health check failure', async () => {
      mockCodeGuideInstance.isHealthy.mockResolvedValue(false)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('🔐 Checking authentication...')
      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Error: Authentication failed or API service is not available'
      )
      expect(errorSpy).toHaveBeenCalledWith('💡 Please login again with a valid API key:')
      expect(errorSpy).toHaveBeenCalledWith('   codeguide login')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      errorSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle invalid directory', async () => {
      validateDirectory.mockReturnValue({ valid: false, error: 'Directory does not exist' })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error:')
      expect(consoleSpy).toHaveBeenCalledWith('   Context: Failed to validate directory')
      expect(consoleSpy).toHaveBeenCalledWith('   Message: Directory does not exist')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should work with custom language and context', async () => {
      const mockTitleResponse = { title: 'Python API Server' }
      const mockOutlineResponse = { outline: 'Project outline' }
      const mockDocResponse = { success: true }
      const mockProject = { id: 'proj_456', title: 'Python API Server' }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.generation.generateTitle.mockResolvedValue(mockTitleResponse)
      mockCodeGuideInstance.generation.generateOutline.mockResolvedValue(mockOutlineResponse)
      mockCodeGuideInstance.generation.generateMultipleDocuments.mockResolvedValue(mockDocResponse)
      mockCodeGuideInstance.generation.generateMissingDocuments.mockResolvedValue({ data: [] })
      mockCodeGuideInstance.projects.createProject.mockResolvedValue(mockProject)
      mockCodeGuideInstance.tasks.generateTasks.mockResolvedValue({
        status: 'success',
        data: { task_groups_created: 1, tasks_created: 3 },
      })
      mockCodeGuideInstance.projects.getProjectDocuments.mockResolvedValue({ data: [] })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync([
        'node',
        'test',
        'start',
        'Create a Python API server',
        '--language',
        'python',
        '--context',
        'REST API with FastAPI',
        '--api-key',
        'sk_test123',
      ])

      expect(mockCodeGuideInstance.generation.generateTitle).toHaveBeenCalledWith({
        description: 'Create a Python API server',
        language: 'python',
        context: 'REST API with FastAPI',
      })

      expect(mockCodeGuideInstance.generation.generateOutline).toHaveBeenCalledWith({
        project_type: 'python',
        description: 'Create a Python API server',
        title: 'Python API Server',
        language: 'python',
        context: 'REST API with FastAPI',
      })

      consoleSpy.mockRestore()
    })

    it('should handle documentation generation failure', async () => {
      const mockTitleResponse = { title: 'Test Project' }
      const mockOutlineResponse = { outline: 'Outline' }
      const mockDocResponse = { success: false, error: 'API Error' }
      const mockProject = { id: 'proj_789', title: 'Test Project' }

      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.generation.generateTitle.mockResolvedValue(mockTitleResponse)
      mockCodeGuideInstance.generation.generateOutline.mockResolvedValue(mockOutlineResponse)
      mockCodeGuideInstance.generation.generateMultipleDocuments.mockResolvedValue(mockDocResponse)
      mockCodeGuideInstance.generation.generateMissingDocuments.mockResolvedValue({ data: [] })
      mockCodeGuideInstance.projects.createProject.mockResolvedValue(mockProject)
      mockCodeGuideInstance.tasks.generateTasks.mockResolvedValue({
        status: 'success',
        data: { task_groups_created: 1, tasks_created: 3 },
      })
      mockCodeGuideInstance.projects.getProjectDocuments.mockResolvedValue({ data: [] })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt', '--api-key', 'sk_test123'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error:')
      expect(consoleSpy).toHaveBeenCalledWith('   Context: Failed to create new project')
      expect(consoleSpy).toHaveBeenCalledWith(
        '   Message: Documentation generation failed: API Error'
      )
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle missing API key', async () => {
      authStorage.getAuthConfig.mockReturnValue({})

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt'])

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error: No API key found')
      expect(consoleSpy).toHaveBeenCalledWith('💡 Please login again to save your API key:')
      expect(consoleSpy).toHaveBeenCalledWith('   codeguide login --api-key YOUR_API_KEY')
      expect(consoleSpy).toHaveBeenCalledWith('   or use --api-key option to provide an API key')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should handle authentication failure', async () => {
      authStorage.getAuthConfig.mockReturnValue({ apiKey: 'sk_test123' })
      mockCodeGuideInstance.isHealthy.mockResolvedValue(false)

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const processSpy = jest.spyOn(process, 'exit').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt'])

      expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Checking authentication...')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error: Authentication failed or API service is not available'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('💡 Please login again with a valid API key:')
      expect(consoleErrorSpy).toHaveBeenCalledWith('   codeguide login')
      expect(processSpy).toHaveBeenCalledWith(1)

      consoleLogSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      processSpy.mockRestore()
    })

    it('should use saved API key when no command line key provided', async () => {
      const mockTitleResponse = { title: 'Test Project' }
      const mockOutlineResponse = { outline: 'Outline' }
      const mockDocResponse = { success: true }
      const mockProject = { id: 'proj_789', title: 'Test Project' }

      authStorage.getAuthConfig.mockReturnValue({ apiKey: 'sk_saved_key' })
      mockCodeGuideInstance.isHealthy.mockResolvedValue(true)
      mockCodeGuideInstance.generation.generateTitle.mockResolvedValue(mockTitleResponse)
      mockCodeGuideInstance.generation.generateOutline.mockResolvedValue(mockOutlineResponse)
      mockCodeGuideInstance.generation.generateMultipleDocuments.mockResolvedValue(mockDocResponse)
      mockCodeGuideInstance.generation.generateMissingDocuments.mockResolvedValue({ data: [] })
      mockCodeGuideInstance.projects.createProject.mockResolvedValue(mockProject)
      mockCodeGuideInstance.tasks.generateTasks.mockResolvedValue({
        status: 'success',
        data: { task_groups_created: 1, tasks_created: 3 },
      })
      mockCodeGuideInstance.projects.getProjectDocuments.mockResolvedValue({ data: [] })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await program.parseAsync(['node', 'test', 'start', 'Test prompt'])

      expect(consoleSpy).toHaveBeenCalledWith('🔐 Checking authentication...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Authentication successful')

      // Verify the CodeGuide was created with saved API key
      expect(CodeGuide).toHaveBeenCalledWith(
        {
          baseUrl: 'https://api.codeguide.dev',
          databaseApiKey: 'sk_saved_key',
        },
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })
})
