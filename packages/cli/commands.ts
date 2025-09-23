import { Command } from 'commander'
import { CodeGuide } from '@codeguide/core'
import {
  getCurrentDirectory,
  isRootDirectory,
  getProjectInfo,
  generateProjectDescription,
  validateDirectory,
} from './utils/directory-utils'
import { authStorage } from './utils/auth-storage'
import { handleError, CliError, ApiCliError } from './utils/error-handling'
import dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})

// Utility functions for file system operations
const fs = require('fs')

/**
 * Convert title to safe directory name (kebab-case)
 */
function toSafeDirectoryName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim()
}

/**
 * Create unique directory name if directory already exists
 */
function createUniqueDirectory(basePath: string, safeName: string): string {
  let dirPath = path.join(basePath, safeName)

  if (!fs.existsSync(dirPath)) {
    return safeName
  }

  // Add timestamp to make it unique
  const timestamp = Date.now()
  const uniqueName = `${safeName}-${timestamp}`
  dirPath = path.join(basePath, uniqueName)

  return uniqueName
}

/**
 * Create directory structure for the project
 */
function createProjectDirectories(projectTitle: string): {
  projectDir: string
  docsDir: string
  projectName: string
} {
  const currentDir = process.cwd()
  const safeName = toSafeDirectoryName(projectTitle)
  const projectName = createUniqueDirectory(currentDir, safeName)

  const projectDir = path.join(currentDir, projectName)
  const docsDir = path.join(projectDir, 'documentation')

  // Create project directory
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true })
  }

  // Create documentation directory
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  return { projectDir, docsDir, projectName }
}

/**
 * Save document as markdown file
 */
function saveDocument(docsDir: string, filename: string, content: string): void {
  const filePath = path.join(docsDir, filename.endsWith('.md') ? filename : `${filename}.md`)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(` Saved: ${filePath}`)
}

/**
 * Generate instructions.md content
 */
function generateInstructionsMdContent(projectTitle: string, projectId: string): string {
  return `# Project Instructions

## Getting Started

Welcome to your new **${projectTitle}** project! This project was created using CodeGuide CLI and comes with a structured task management system to guide your development process.

## First Steps

### 1. View Your Tasks
The first thing you should do is look at the tasks that have been generated for your project:

\`\`\`bash
codeguide task list
\`\`\`

This will show you all the available tasks, organized by status (pending, in_progress, completed).

### 2. Start with Your First Task
Choose a task from the list and begin working on it:

\`\`\`bash
codeguide task update <task_id> --status in_progress
\`\`\`

Replace \`<task_id>\` with the actual ID of the task you want to work on.

### 3. Track Your Progress
As you work on tasks, update your progress:

\`\`\`bash
codeguide task update <task_id> "your progress notes"
\`\`\`

When you complete a task, mark it as completed:

\`\`\`bash
codeguide task update <task_id> --status completed
\`\`\`

## Project Information

- **Project ID**: ${projectId}
- **Created with**: CodeGuide CLI
- **Documentation**: Check the \`documentation/\` folder for generated project documentation
- **AI Guidelines**: See \`AGENTS.md\` for AI development agent guidelines

## Recommended Workflow

1. **Review Tasks**: Always start by reviewing available tasks
2. **Plan Your Work**: Choose tasks that make sense to work on next
3. **Start Tasks**: Use \`codeguide task update <task_id> --status in_progress\` to begin work on a task
4. **Update Progress**: Keep your task progress updated as you work
5. **Complete Tasks**: Mark tasks as completed when finished
6. **Generate Documentation**: Use \`codeguide generate\` for new features

## 🧹 Cleanup Instructions

### When You're Done with Setup

Once you've reviewed all the documentation and are ready to start development, you should clean up the project structure:

#### If this project was created in a subdirectory (not current directory):

1. **Move essential files to the project root:**
   \`\`\`bash
   # Move documentation folder to project root
   mv documentation/ ../

   # Move AGENTS.md to project root
   mv AGENTS.md ../

   # Move codeguide.json to project root
   mv codeguide.json ../

   # Navigate to the parent directory
   cd ..
   \`\`\`

2. **Remove the now-empty subdirectory:**
   \`\`\`bash
   # Remove the subdirectory (replace with actual directory name)
   rmdir <project-subdirectory-name>
   \`\`\`

3. **Delete this instructions.md file:**
   \`\`\`bash
   rm instructions.md
   \`\`\`

#### Your final project structure should be:
\`\`\`
project-root/
├── documentation/          # Project documentation
├── AGENTS.md               # AI development guidelines
├── codeguide.json          # CodeGuide project configuration
└── (your source code files)
\`\`\`

### Benefits of Cleanup:
- **Cleaner project structure** - No unnecessary nested directories
- **Better navigation** - All files are at the project root
- **Professional setup** - Matches standard project layouts
- **Removes setup artifacts** - No temporary instruction files

## Getting Help

- Use \`codeguide --help\` for general help
- Use \`codeguide <command> --help\` for command-specific help
- Use \`codeguide task list --help\` for task management help

---

*This file was generated by CodeGuide CLI on ${new Date().toISOString()}*
`
}

/**
 * Generate AGENT.md content
 */
function generateAgentMdContent(projectTitle: string, project: string): string {
  return `# AI Development Agent Guidelines

## Project Overview
**Project:** ${projectTitle}
**** ${project}

## CodeGuide CLI Usage Instructions

This project is managed using CodeGuide CLI. The AI agent should follow these guidelines when working on this project.

### Essential Commands

#### Project Setup & Initialization
\`\`\`bash
# Login to CodeGuide (first time setup)
codeguide login

# Start a new project (generates title, outline, docs, tasks)
codeguide start "project description prompt"

# Initialize current directory with CLI documentation
codeguide init
\`\`\`

#### Task Management
\`\`\`bash
# List all tasks
codeguide task list

# List tasks by status
codeguide task list --status pending
codeguide task list --status in_progress
codeguide task list --status completed

# Start working on a task
codeguide task start <task_id>

# Update task with AI results
codeguide task update <task_id> "completion summary or AI results"

# Update task status
codeguide task update <task_id> --status completed
\`\`\`

#### Documentation Generation
\`\`\`bash
# Generate documentation for current project
codeguide generate

# Generate documentation with custom prompt
codeguide generate --prompt "specific documentation request"

# Generate documentation for current codebase
codeguide generate --current-codebase
\`\`\`

#### Project Analysis
\`\`\`bash
# Analyze current project structure
codeguide analyze

# Check API health
codeguide health
\`\`\`

### Workflow Guidelines

1. **Before Starting Work:**
   - Run \`codeguide task list\` to understand current tasks
   - Identify appropriate task to work on
   - Use \`codeguide task update <task_id> --status in_progress\` to begin work

2. **During Development:**
   - Follow the task requirements and scope
   - Update progress using \`codeguide task update <task_id>\` when significant milestones are reached
   - Generate documentation for new features using \`codeguide generate\`

3. **Completing Work:**
   - Update task with completion summary: \`codeguide task update <task_id> "completed work summary"\`
   - Mark task as completed: \`codeguide task update <task_id> --status completed\`
   - Generate any necessary documentation

### AI Agent Best Practices

- **Task Focus**: Work on one task at a time as indicated by the task management system
- **Documentation**: Always generate documentation for new features and significant changes
- **Communication**: Provide clear, concise updates when marking task progress
- **Quality**: Follow existing code patterns and conventions in the project
- **Testing**: Ensure all changes are properly tested before marking tasks complete

### Project Configuration
This project includes:
- \`codeguide.json\`: Project configuration with ID and metadata
- \`documentation/\`: Generated project documentation
- \`AGENTS.md\`: AI agent guidelines

### Getting Help
Use \`codeguide --help\` or \`codeguide <command> --help\` for detailed command information.

---
*Generated by CodeGuide CLI on ${new Date().toISOString()}*
`
}

/**
 * Read project ID from codeguide.json file
 */
function getProjectIdFromConfig(currentDir: string): string | null {
  try {
    const configPath = path.join(currentDir, 'codeguide.json')
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configContent)
      return config.projectId || null
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Create codeguide.json configuration file
 */
function createCodeguideConfig(projectDir: string, projectId: string, projectTitle: string): void {
  const config = {
    projectId: projectId,
    projectTitle: projectTitle,
    createdAt: new Date().toISOString(),
    version: '1.0.0',
    codeguide: {
      cliVersion: '1.0.0',
      generated: true,
    },
  }

  const configPath = path.join(projectDir, 'codeguide.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
  console.log(`  Saved: ${configPath}`)
}

/**
 * Simple Header
 */
function showHeader(): void {
  // Get version from CLI package.json
  const packageJson = require('../package.json')
  const version = packageJson.version || '0.0.0'

  console.log('\x1b[34m')
  console.log(`CodeGuide CLI ${version}`)
  console.log('\x1b[0m')
  console.log('')
}

/**
 * Loading animation with spinner and log clearing
 */
class LoadingAnimation {
  private interval: NodeJS.Timeout | null = null
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private currentFrame = 0
  private message: string = ''

  start(message: string): void {
    this.currentFrame = 0
    this.message = message
    process.stdout.write(`\r\x1b[K${this.frames[this.currentFrame]} ${message}`)

    this.interval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length
      process.stdout.write(`\r\x1b[K${this.frames[this.currentFrame]} ${message}`)
    }, 100)
  }

  update(message: string): void {
    this.message = message
    process.stdout.write(`\r\x1b[K${this.frames[this.currentFrame]} ${message}`)
  }

  stop(final: string): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    process.stdout.write(`\r\x1b[K${final}\n`)
  }

  fail(message: string): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    process.stdout.write(`\r\x1b[K${message}\n`)
  }
}

/**
 * Execute async operation with loading animation
 */
async function withLoadingAnimation<T>(
  operation: () => Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage: string
): Promise<T> {
  const loadingAnimation = new LoadingAnimation()

  try {
    loadingAnimation.start(loadingMessage)
    const result = await operation()
    loadingAnimation.stop(successMessage)
    return result
  } catch (error) {
    loadingAnimation.fail(errorMessage)
    throw error
  }
}

export function createCommands(program: Command): void {
  program
    .command('start')
    .description('Create a new project with generated documentation')
    .argument('[prompt]', 'Project description prompt (optional - will prompt if not provided)')
    .option('-l, --language <language>', 'Programming language')
    .option('-c, --context <context>', 'Additional context')
    .option('-v, --verbose', 'Verbose output')
    .option('-o, --output <file>', 'Output file (default: README.md)')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .option(
      '--current-codebase',
      'Generate documentation in current directory instead of creating new project directory'
    )
    .action(async (prompt: string | undefined, options) => {
      try {
        // Show ASCII art header
        showHeader()

        const currentDir = getCurrentDirectory()

        // Validate current directory
        const validation = validateDirectory(currentDir)
        if (!validation.valid) {
          handleError(
            new CliError(validation.error || 'Invalid directory', 'Directory validation'),
            'Failed to validate directory'
          )
          process.exit(1)
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Create CodeGuide instance with authentication
        const codeguide = new CodeGuide(
          {
            baseUrl: options.apiUrl || savedConfig.apiUrl,
            databaseApiKey: authApiKey,
          },
          {
            language: options.language,
            context: options.context,
            verbose: options.verbose,
          }
        )

        const isHealthy = await codeguide.isHealthy()
        if (!isHealthy) {
          console.error('Error: Authentication failed or API service is not available')
          console.error('Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        // Declare project variables that will be used throughout the process
        let finalPrompt: string
        let projectTitle: string
        let projectOutline: string
        let projectDir: string
        let docsDir: string
        let projectName: string
        let useCurrentCodebase: boolean

        if (prompt) {
          finalPrompt = prompt
          useCurrentCodebase = options.currentCodebase
        } else {
          // Interactive mode - only show the question
          console.log('Welcome to Project Creator!')
          console.log('')

          const readline = require('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          // Show the question and subheading first
          console.log('What do you want to build? ')
          console.log('\x1b[90mDescribe your project in detail. The more specific you are, the better we can help you bring your vision to life.\x1b[0m')
          console.log('')

          // Then get the input
          finalPrompt = await new Promise<string>(resolve => {
            rl.question('> ', (answer: string) => {
              rl.close()
              resolve(answer.trim())
            })
          })
        }

        if (!finalPrompt) {
          console.error('Error: Project description is required')
          process.exit(1)
        }

        // Ask if user wants to create new project directory if flag is not set
        useCurrentCodebase = options.currentCodebase
        if (!useCurrentCodebase) {
          const readline = require('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          const answer = await new Promise<string>(resolve => {
            rl.question(
              'Do you want to create a new project directory? (y/N): ',
              (answer: string) => {
                rl.close()
                resolve(answer.trim().toLowerCase())
              }
            )
          })

          useCurrentCodebase = !(answer === 'y' || answer === 'yes')
        }

        // Generate title
        try {
          const titleResponse = await withLoadingAnimation(
            async () => {
              return await codeguide.generation.generateTitle({
                description: finalPrompt,
                ...(options.language && { language: options.language }),
                ...(options.context && { context: options.context }),
              })
            },
            'Generating project title...',
            '✓ Project title generated',
            'Failed to generate project title'
          )

          projectTitle = titleResponse.title

          // Create directory structure (conditional based on current-codebase mode)
          if (!useCurrentCodebase) {
            const dirs = createProjectDirectories(projectTitle)
            projectDir = dirs.projectDir
            docsDir = dirs.docsDir
            projectName = dirs.projectName
          } else {
            // For current-codebase mode, use current directory and create documentation folder
            const docsDirName = 'documentation'
            const docsDirPath = path.join(currentDir, docsDirName)
            if (!fs.existsSync(docsDirPath)) {
              fs.mkdirSync(docsDirPath, { recursive: true })
            }
            projectDir = currentDir
            docsDir = docsDirPath
            projectName = path.basename(currentDir)
          }
        } catch (error) {
          console.error('Failed to generate project title')

          // Enhanced error logging
          if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as any
            console.error('API Error Details:')
            console.error('  Status:', apiError.response?.status || 'Unknown')
            console.error('  Status Text:', apiError.response?.statusText || 'Unknown')
            console.error('  URL:', apiError.config?.url || 'Unknown')
            console.error('  Method:', apiError.config?.method || 'Unknown')

            if (apiError.response?.data) {
              console.error('  Response Data:', JSON.stringify(apiError.response.data, null, 2))
            }

            if (apiError.message) {
              console.error('  Error:', apiError.message)
            }
          } else if (error instanceof Error) {
            console.error('Error Details:')
            console.error('  Type:', error.constructor.name)
            console.error('  Message:', error.message)
            if (options.verbose && error.stack) {
              console.error('  Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
            }
          } else {
            console.error('Unknown Error:', JSON.stringify(error, null, 2))
          }

          throw error
        }

        // Generate outline
        try {
          const outlineResponse = await withLoadingAnimation(
            async () => {
              // Show API request details in verbose mode
              if (options.verbose) {
                console.log(' ')
                console.log('    /generation/generate-outline')
                console.log('   Project Type:', options.language || 'general')
                console.log('   ', finalPrompt)
                console.log('   Title:', projectTitle)
                console.log('   Selected Tools: [] (empty array)')
                console.log('   ', options.language || 'not specified')
                console.log('   Context:', options.context || 'not provided')
              }

              const response = await codeguide.generation.generateOutline({
                project_type: options.language || 'general',
                description: finalPrompt,
                title: projectTitle,
                selected_tools: [], // Default empty array for selected tools
                ...(options.language && { language: options.language }),
                ...(options.context && { context: options.context }),
              })

              // Show API response details in verbose mode
              if (options.verbose) {
                console.log(' ')
                console.log('    Success')
                console.log(
                  '   Outline Length:',
                  response.outline ? response.outline.length : 0,
                  'characters'
                )
                if (response.outline) {
                  console.log('   Outline Preview:', response.outline.substring(0, 100) + '...')
                }
              }

              return response
            },
            'Generating project outline...',
            'Project outline generated',
            'Failed to generate project outline'
          )

          projectOutline = outlineResponse.outline
          console.log('✓ Outline generated successfully')

          if (options.verbose && projectOutline) {
            console.log('Generated Outline Preview:')
            console.log(projectOutline.substring(0, 200) + '...')
          }
        } catch (error) {
          console.error(' Failed to generate project outline')

          // Enhanced error logging
          if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as any
            console.error(' API Error Details:')
            console.error('   ', apiError.response?.status || 'Unknown')
            console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
            console.error('   URL:', apiError.config?.url || 'Unknown')
            console.error('   Method:', apiError.config?.method || 'Unknown')

            if (apiError.response?.data) {
              console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
            }

            if (apiError.message) {
              console.error('   Error ', JSON.stringify(apiError.message))
            }
          } else if (error instanceof Error) {
            console.error(' Error Details:')
            console.error('   Type:', error.constructor.name)
            console.error('   ', error.message)
            if (error.stack) {
              console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
            }
          } else {
            console.error(' Unknown Error:', JSON.stringify(error, null, 2))
          }

          throw error
        }

        // Create project (conditional based on current-codebase mode)
        let project: any
        if (!useCurrentCodebase) {
          // Show API request details in verbose mode
          if (options.verbose) {
            console.log('\nAPI Request Details:')
            console.log('  Endpoint: /projects')
            console.log('  Title:', projectTitle)
            console.log('  Description Length:', finalPrompt.length, 'characters')
            console.log('  Outline Length:', projectOutline.length, 'characters')
            console.log('  Status: in_progress')
            console.log('  Language:', options.language || 'not specified')
          }

          try {
            project = await withLoadingAnimation(
              async () => {
                const projectRequest = {
                  title: projectTitle,
                  description: finalPrompt,
                  outline: projectOutline,
                  status: 'in_progress', // Changed from 'active' to 'in_progress' to match API validation
                  ...(options.language && { language: options.language }),
                }

                const response = await codeguide.projects.createProject(projectRequest)

                // Show API response details in verbose mode
                if (options.verbose) {
                  console.log('\nAPI Response Details:')
                  console.log('  Status: Success')
                  console.log('  Project ID:', response.id)
                  console.log('  Project Title:', response.title || 'Unknown')
                }

                return response
              },
              'Creating project...',
              '✓ Project created successfully',
              'Failed to create project'
            )

            console.log('✓ Project API created')
            console.log(`  Project ID: ${project.id}`)

            // Create codeguide.json configuration file
            createCodeguideConfig(projectDir, project.id, projectTitle)
          } catch (error) {
            console.error('Failed to create project')
            throw error
          }
        } else {
          // Show API request details in verbose mode
          if (options.verbose) {
            console.log('\nAPI Request Details:')
            console.log('  Mode: Current directory')
            console.log('  Title:', projectTitle)
            console.log('  Description Length:', finalPrompt.length, 'characters')
            console.log('  Outline Length:', projectOutline.length, 'characters')
          }

          try {
            project = await withLoadingAnimation(
              async () => {
                const projectRequest = {
                  title: projectTitle,
                  description: finalPrompt,
                  outline: projectOutline,
                  status: 'in_progress',
                  ...(options.language && { language: options.language }),
                }

                const response = await codeguide.projects.createProject(projectRequest)

                // Show API response details in verbose mode
                if (options.verbose) {
                  console.log('\nAPI Response Details:')
                  console.log('  Status: Success')
                  console.log('  Project ID:', response.id)
                  console.log('  Project Title:', response.title || 'Unknown')
                }

                return response
              },
              'Creating project...',
              '✓ Project created successfully',
              'Failed to create project'
            )

            console.log('✓ Project API created')
            console.log(`  Project ID: ${project.id}`)

            // Create codeguide.json configuration file in current directory
            createCodeguideConfig(projectDir, project.id, projectTitle)
          } catch (error) {
            console.error('Failed to create project')
            throw error
          }
        }

        // Generate missing documents
        if (options.verbose) {
          console.log('\nAPI Request Details:')
          console.log('  Endpoint: /generation/generate-missing-documents')
          console.log('  Project ID:', project.id)
          console.log('  Auto-generating missing documents based on project data')
        }

        const docResponse = await withLoadingAnimation(
          async () => {
            const request = {
              project_id: project.id,
            }

            const response = await codeguide.generation.generateMissingDocuments(request)

            // Show API response details in verbose mode
            if (options.verbose) {
              console.log('\nAPI Response Details:')
              console.log('  Status:', response.success ? 'Success' : 'Failed')
              console.log('  Success:', response.success)
              if (response.message) {
                console.log('  Message:', response.message)
              }
              if (response.error) {
                console.log('  Error:', response.error)
              }
              if (response.generated_documents && Array.isArray(response.generated_documents)) {
                console.log('  Generated Documents:', response.generated_documents.length)
                response.generated_documents.forEach((docType: string, index: number) => {
                  console.log(`    ${index + 1}. ${docType}`)
                })
              }
            }

            return response
          },
          'Generating documents...',
          '✓ Documents generated successfully',
          'Failed to generate documents'
        )

        if (!docResponse.success) {
          throw new Error(
            `Documentation generation failed: ${docResponse.error || 'Unknown error'}`
          )
        }

        // Fetch and save documents
        if (options.verbose) {
          console.log('\nAPI Request Details:')
          console.log('  Endpoint: /projects/{id}/documents')
          console.log('  Project ID:', project.id)
          console.log('  Current version only: true')
        }

        const documentsResponse = await withLoadingAnimation(
          async () => {
            const response = await codeguide.projects.getProjectDocuments(project.id, {
              current_version_only: true,
            })

            // Show API response details in verbose mode
            if (options.verbose) {
              console.log('\nAPI Response Details:')
              console.log('  Status:', response.status)
              console.log('  Documents Count:', response.data?.length || 0)
              if (response.data && Array.isArray(response.data)) {
                response.data.forEach((doc: any, index: number) => {
                  console.log(`    ${index + 1}. ${doc.title} (${doc.custom_document_type})`)
                })
              }
            }

            return response
          },
          'Fetching documents...',
          '✓ Documents fetched successfully',
          'Failed to fetch documents'
        )

        // Save the fetched documents to the documentation folder
        if (
          documentsResponse.data &&
          Array.isArray(documentsResponse.data) &&
          documentsResponse.data.length > 0
        ) {
          // Save each document with its actual content from the API
          documentsResponse.data.forEach((doc: any) => {
            // Skip implementation_plan.md files
            if (doc.custom_document_type === 'implementation_plan') {
              return
            }
            const safeDocName =
              doc.custom_document_type ||
              doc.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
            const documentContent = `# ${doc.title}

${doc.content}

---
**Document Details**
- **Project ID**: ${project.id}
- **Document ID**: ${doc.id}
- **Type**: ${doc.document_type}
- **Custom Type**: ${doc.custom_document_type}
- **Status**: ${doc.status}
- **Generated On**: ${new Date(doc.created_at).toISOString()}
- **Last Updated**: ${doc.updated_at ? new Date(doc.updated_at).toISOString() : 'N/A'}
`
            saveDocument(docsDir, safeDocName, documentContent)
          })

          console.log(`✓ Saved ${documentsResponse.data.length} documents to ${docsDir}`)
        } else {
          console.log('⚠ No documents returned from API')
        }

        // Generate tasks for the project
        let taskResponse: any
        try {
          if (options.verbose) {
            console.log('\nAPI Request Details:')
            console.log('  Endpoint: /project-tasks/generate-tasks')
            console.log('  Project ID:', project.id)
          }

          taskResponse = await withLoadingAnimation(
            async () => {
              const taskRequest = {
                project_id: project.id,
              }

              const response = await codeguide.tasks.generateTasks(taskRequest)

              if (options.verbose) {
                console.log('\nAPI Response Details:')
                console.log('  Status:', response.status)
                console.log('  Message:', response.message)
                if (response.data) {
                  console.log('  Task Groups Created:', response.data.task_groups_created || 0)
                  console.log('  Tasks Created:', response.data.tasks_created || 0)
                }
              }

              return response
            },
            'Generating tasks...',
            '✓ Tasks generated successfully',
            'Failed to generate tasks'
          )

          console.log('✓ Task generation completed')
          console.log(`  Status: ${taskResponse.status}`)
          console.log(`  Message: ${taskResponse.message}`)

          if (taskResponse.data) {
            console.log('  Results:')
            console.log(`    Task Groups Created: ${taskResponse.data.task_groups_created || 0}`)
            console.log(`    Tasks Created: ${taskResponse.data.tasks_created || 0}`)
          }
        } catch (taskError) {
          console.warn('⚠ Task generation failed, but project setup was successful')
          console.warn('  You can generate tasks later with: codeguide task')

          if (options.verbose) {
            console.warn('\nTask Generation Error Details:')
            if (taskError instanceof Error) {
              console.warn('  Type:', taskError.constructor.name)
              console.warn('  Message:', taskError.message)
            } else {
              console.warn('  Error:', JSON.stringify(taskError, null, 2))
            }
          }
        }

        // Change working directory to the new project directory (only if not current-codebase)
        if (!useCurrentCodebase) {
          process.chdir(projectDir)
        }

        // Final success message with summary
        console.log('\n' + '='.repeat(60))
        console.log('🎉 PROJECT SETUP COMPLETE')
        console.log('='.repeat(60))

        if (useCurrentCodebase) {
          console.log(`📍 Location: Current directory (${currentDir})`)
        } else {
          console.log(`📍 Location: ${projectDir}`)
        }

        console.log(`📋 Project: ${projectTitle}`)
        console.log(`🆔 Project ID: ${project.id}`)
        console.log(`📁 Documentation: ${docsDir}`)

        // Show summary of what was created
        console.log('\n📊 Summary:')
        console.log(`✅ Project created and configured`)
        console.log(`✅ Documentation generated (${documentsResponse.data?.length || 0} documents)`)

        if (taskResponse.data) {
          console.log(`✅ Tasks generated (${taskResponse.data.task_groups_created || 0} groups, ${taskResponse.data.tasks_created || 0} tasks)`)
        }

        console.log('\n🚀 Next Steps:')
        if (!useCurrentCodebase) {
          console.log(`• Run "cd ${projectDir}" to navigate to your project`)
        }
        console.log('• Give this prompt to an AI agent: "follow the instructions in @instructions.md"')
        console.log('• Or run "codeguide task list" to see available tasks')
        console.log('• Run "codeguide task update <task_id> --status in_progress" to begin working on a task')

        console.log('\n' + '='.repeat(60))

        // Initialize project with CLI documentation files
        try {
          // Generate and save AGENTS.md
          const agentMdContent = generateAgentMdContent(projectTitle, finalPrompt)
          const agentMdPath = path.join(projectDir, 'AGENTS.md')
          fs.writeFileSync(agentMdPath, agentMdContent, 'utf8')

          // For new projects (not current-codebase), create instructions.md
          if (!useCurrentCodebase) {
            const instructionsMdContent = generateInstructionsMdContent(projectTitle, project.id)
            const instructionsMdPath = path.join(projectDir, 'instructions.md')
            fs.writeFileSync(instructionsMdPath, instructionsMdContent, 'utf8')
          }
        } catch (initError) {
          console.warn('Failed to create CLI documentation files, but project setup was successful')
        }
      } catch (error) {
        console.error(' Failed to create project or generate documents')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        throw error
      }
    })

  program
    .command('generate')
    .description('Generate documentation for the current project')
    .option('-l, --language <language>', 'Programming language')
    .option('-c, --context <context>', 'Additional context')
    .option('-v, --verbose', 'Verbose output')
    .option('-o, --output <file>', 'Output file (default: README.md)')
    .option('--prompt <prompt>', 'Custom prompt for documentation generation')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async options => {
      try {
        const currentDir = getCurrentDirectory()

        // Validate current directory
        const validation = validateDirectory(currentDir)
        if (!validation.valid) {
          console.error('Error:', validation.error)
          process.exit(1)
        }

        // Check if it's root directory
        if (isRootDirectory(currentDir)) {
          console.error('Error: Cannot generate documentation for root directory')
          process.exit(1)
        }

        // Get project information
        const projectInfo = getProjectInfo(currentDir)
        if (options.verbose) {
          console.log('Project Analysis:')
          console.log(generateProjectDescription(projectInfo))
          console.log('---')
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        const codeguide = new CodeGuide(
          {
            baseUrl: options.apiUrl || savedConfig.apiUrl,
            databaseApiKey: authApiKey,
          },
          {
            language: options.language || projectInfo.language,
            context: options.context || generateProjectDescription(projectInfo),
            verbose: options.verbose,
          }
        )

        const isHealthy = await codeguide.isHealthy()
        if (!isHealthy) {
          console.error('Error: Authentication failed or API service is not available')
          console.error('Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        if (options.prompt) {
          console.log(' Generating documentation based on your custom prompt...')
        } else {
          console.log(' Generating documentation for current project...')
        }

        let finalPrompt
        if (options.prompt) {
          finalPrompt = `Generate comprehensive documentation based on the following request. Format the output in Markdown with proper structure, headers, and code examples where applicable.

User Request: ${options.prompt}

Please include:
- Clear headings and subheadings
- Code examples with syntax highlighting
- Installation and setup instructions
- Usage examples
- API documentation (if applicable)
- Troubleshooting section`
        } else {
          finalPrompt = `Generate comprehensive documentation for a ${projectInfo.type} project called "${projectInfo.name}" written in ${projectInfo.language}.
The project has these main dependencies: ${projectInfo.dependencies.slice(0, 5).join(', ')}.
Include installation instructions, usage examples, and API documentation where applicable.
Format the documentation in Markdown with proper headers, code examples, and structure.`
        }

        const response = await codeguide.getGuidance(finalPrompt)

        const outputFile = options.output || 'README.md'
        const fs = require('fs')
        const path = require('path')
        const outputPath = path.join(currentDir, outputFile)

        fs.writeFileSync(outputPath, response.response)

        if (options.prompt) {
          console.log(` Custom documentation generated successfully!`)
        } else {
          console.log(` Documentation generated successfully!`)
        }
        console.log(` Output file: ${outputPath}`)
      } catch (error) {
        handleError(error, 'Failed to generate documentation')
        process.exit(1)
      }
    })

  program
    .command('health')
    .description('Check API health')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async options => {
      try {
        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl,
          databaseApiKey: options.apiKey || savedConfig.apiKey,
        })

        const isHealthy = await codeguide.isHealthy()
        if (isHealthy) {
          console.log(' API is healthy')
        } else {
          console.log(' API is not healthy')
          process.exit(1)
        }
      } catch (error) {
        handleError(error, 'Failed to check API health')
        process.exit(1)
      }
    })

  // Authentication commands
  program
    .command('login')
    .description('Save API key for future use (supports --api-key flag for non-interactive login)')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async options => {
      try {
        console.log(' CodeGuide Login')
        console.log('==================')

        let apiKey: string
        if (options.apiKey && options.apiKey.trim()) {
          apiKey = options.apiKey
          console.log(' Using API key from command line')
        } else if (process.env.CODEGUIDE_API_KEY && process.env.CODEGUIDE_API_KEY.trim()) {
          apiKey = process.env.CODEGUIDE_API_KEY
          console.log(' Using API key from environment variable')
        } else {
          const readline = require('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          apiKey = await new Promise<string>(resolve => {
            rl.question(' Enter your API key: ', (answer: string) => {
              rl.close()
              resolve(answer.trim())
            })
          })
        }

        if (!apiKey) {
          console.error(' Error: API key is required')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        if (!apiKey.startsWith('sk_')) {
          console.warn('  Warning: API keys should start with "sk_"')
        }

        const authConfig = {
          apiKey: apiKey,
          apiUrl: options.apiUrl,
        }

        authStorage.saveAuthConfig(authConfig)

        console.log(' API key saved successfully!')
        console.log('')
        console.log(authStorage.getAuthInfo())
        console.log('')
        console.log(' Next steps:')
        console.log('   • Run "codeguide start" to create a new project')
        console.log('   • Run "codeguide generate" to generate documentation')
        console.log('   • Use "codeguide logout" to remove credentials')
      } catch (error) {
        handleError(error, 'Failed to login')
        process.exit(1)
      }
    })

  program
    .command('logout')
    .description('Remove saved API key')
    .action(async () => {
      try {
        if (!authStorage.hasAuthConfig()) {
          console.log('No API key to remove')
          return
        }

        authStorage.clearAuthConfig()
        console.log(' API key removed successfully')
      } catch (error) {
        handleError(error, 'Failed to logout')
        process.exit(1)
      }
    })

  program
    .command('auth')
    .description('API key management commands')
    .argument('<action>', 'Action to perform (status, show)')
    .action(async action => {
      try {
        if (action === 'status' || action === 'show') {
          if (!authStorage.hasAuthConfig()) {
            console.log('🔓 No API key configured')
            console.log(' Use "codeguide login" to save your API key')
            console.log(
              ' Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
            )
          } else {
            console.log('🔒 API Key ')
            console.log(authStorage.getAuthInfo())
            console.log(' Use "codeguide logout" to remove API key')
          }
        } else {
          console.error('Error: Invalid action. Use "status" or "show"')
          process.exit(1)
        }
      } catch (error) {
        handleError(error, 'Failed to check authentication status')
        process.exit(1)
      }
    })

  const taskProgram = program
    .command('task')
    .description('Manage project tasks')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)

  // task generate - Generate tasks for a project
  taskProgram
    .command('generate')
    .description('Generate tasks for a project')
    .option('--project-id <id>', 'Project ID (overrides codeguide.json)')
    .option('-v, --verbose', 'Verbose output')
    .action(async options => {
      try {
        const currentDir = process.cwd()

        // Get project ID from command line or codeguide.json
        let projectId = options.projectId
        if (!projectId) {
          projectId = getProjectIdFromConfig(currentDir)
          if (!projectId) {
            console.error(' No project ID found')
            console.error(
              ' Either specify --project-id or run this command in a directory with codeguide.json'
            )
            process.exit(1)
          }
        }

        if (options.verbose) {
          console.log(' Task Generation Details:')
          console.log('   Project ID:', projectId)
          console.log('   Current Directory:', currentDir)
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Initialize API service
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl || process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev',
          databaseApiKey: authApiKey,
        })

        // Check authentication
        try {
          await codeguide.usage.healthCheck()
          if (options.verbose) {
            console.log(' Authentication successful')
          }
        } catch (error) {
          console.error(' Authentication failed or API service is not available')
          console.error(' Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        console.log(' Generating tasks for project...')
        console.log(' Project ID:', projectId)

        // Generate tasks
        const response = await withLoadingAnimation(
          async () => {
            if (options.verbose) {
              console.log(' ')
              console.log('    /project-tasks/generate-tasks')
              console.log('   Project ID:', projectId)
            }

            const request = {
              project_id: projectId,
            }

            const response = await codeguide.tasks.generateTasks(request)

            if (options.verbose) {
              console.log(' ')
              console.log('   ', response.status)
              console.log('   ', response.message)
              if (response.data) {
                console.log('   Task Groups Created:', response.data.task_groups_created || 0)
                console.log('   Tasks Created:', response.data.tasks_created || 0)
              }
            }

            return response
          },
          'Generating tasks...',
          'Tasks generated successfully',
          'Failed to generate tasks'
        )

        console.log(' Task generation completed!')
        console.log(' ', response.status)
        console.log(' ', response.message)

        if (response.data) {
          console.log(' Results:')
          console.log('   Task Groups Created:', response.data.task_groups_created || 0)
          console.log('   Tasks Created:', response.data.tasks_created || 0)
        }

        console.log(' You can now view and manage your tasks with: codeguide task list')
      } catch (error) {
        console.error(' Failed to generate tasks')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  // task list - List tasks for a project
  taskProgram
    .command('list')
    .description('List tasks for a project')
    .option('--project-id <id>', 'Project ID (overrides codeguide.json)')
    .option('--status <status>', 'Filter by task status (e.g., pending, in_progress, completed)')
    .option('--task-group-id <id>', 'Filter by task group ID')
    .option('-v, --verbose', 'Verbose output')
    .action(async options => {
      try {
        const currentDir = process.cwd()

        // Get project ID from command line or codeguide.json
        let projectId = options.projectId
        if (!projectId) {
          projectId = getProjectIdFromConfig(currentDir)
          if (!projectId) {
            console.error(' No project ID found')
            console.error(
              ' Either specify --project-id or run this command in a directory with codeguide.json'
            )
            process.exit(1)
          }
        }

        if (options.verbose) {
          console.log('📋 Task List Details:')
          console.log('  • Project ID:', projectId)
          console.log('  • Current Directory:', currentDir)
          console.log('  • Status Filter:', options.status || 'All')
          console.log('  • Task Group Filter:', options.taskGroupId || 'All')
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Initialize API service
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl || process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev',
          databaseApiKey: authApiKey,
        })

        // Check authentication
        try {
          await codeguide.usage.healthCheck()
          if (options.verbose) {
            console.log(' Authentication successful')
          }
        } catch (error) {
          console.error(' Authentication failed or API service is not available')
          console.error(' Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        // Get tasks by project
        const response = await withLoadingAnimation(
          async () => {
            if (options.verbose) {
              console.log('\nAPI Request Details:')
              console.log('  Endpoint: /project-tasks/by-project/{project_id}')
              console.log('  Project ID:', projectId)
              console.log('  Status Filter:', options.status || 'Not specified')
              console.log('  Task Group Filter:', options.taskGroupId || 'Not specified')
            }

            const request = {
              project_id: projectId,
              ...(options.status && { status: options.status }),
              ...(options.taskGroupId && { task_group_id: options.taskGroupId }),
            }

            const response = await codeguide.tasks.getTasksByProject(request)

            if (options.verbose) {
              const verboseTasks = Array.isArray(response.data) ? response.data : response.data?.tasks || []
              const verboseTaskGroups = response.data?.task_groups || []
              console.log('\nAPI Response Details:')
              console.log('  Status:', response.status)
              console.log('  Response Type:', Array.isArray(response.data) ? 'Direct Tasks Array' : 'Nested Structure')
              console.log('  Task Groups:', verboseTaskGroups.length)
              console.log('  Tasks:', verboseTasks.length)
            }

            return response
          },
          'Fetching tasks...',
          'Tasks fetched successfully',
          'Failed to fetch tasks'
        )

        // Handle different response structures
        const tasks = Array.isArray(response.data) ? response.data : response.data?.tasks || []
        const taskGroups = response.data?.task_groups || []

        // Group tasks by status for better organization
        const tasksByStatus = tasks.reduce(
          (acc: Record<string, any[]>, task: any) => {
            if (!acc[task.status]) {
              acc[task.status] = []
            }
            acc[task.status].push(task)
            return acc
          },
          {} as Record<string, any[]>
        )

        // Display tasks
        if (tasks.length > 0) {
          console.log('\n📋 Tasks:')

          // Display tasks by status
          Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
            const statusIcon = getStatusIcon(status)
            const tasksArray = statusTasks as any[]
            console.log(`\n${statusIcon} ${status.toUpperCase()} (${tasksArray.length}):`)
            tasksArray.forEach((task: any, index: number) => {
              console.log(`   ${index + 1}. ${task.title}`)
              if (task.priority) {
                console.log(`      Priority: ${task.priority.toUpperCase()}`)
              }
              console.log(`      ID: ${task.id}`)
              if (task.description) {
                console.log(`      Description: ${task.description}`)
              }
              if (task.created_at) {
                const createdDate = new Date(task.created_at)
                console.log(`      Created: ${isNaN(createdDate.getTime()) ? task.created_at : createdDate.toLocaleDateString()}`)
              }
              if (task.updated_at) {
                const updatedDate = new Date(task.updated_at)
                console.log(`      Updated: ${isNaN(updatedDate.getTime()) ? task.updated_at : updatedDate.toLocaleDateString()}`)
              }
              if (task.details) {
                console.log(`      Details: ${task.details}`)
              }
              if (task.parent_task_id) {
                console.log(`      Parent Task: ${task.parent_task_id}`)
              }
              if (task.ordinal !== undefined) {
                console.log(`      Order: ${task.ordinal}`)
              }
              if (options.verbose) {
                console.log(`      User ID: ${task.user_id}`)
                console.log(`      Task Group ID: ${task.task_group_id}`)
              }
            })
          })
        } else {
          console.log('\n📝 No tasks found')
          console.log('   Run "codeguide task generate" to create tasks for your project')
        }

        // Summary
        const totalTasks = tasks.length
        console.log('\n📊 Summary:')
        console.log(`  • Total Tasks: ${totalTasks}`)

        if (Object.keys(tasksByStatus).length > 1) {
          console.log('\n  Tasks by Status:')
          Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
            const tasksArray = statusTasks as any[]
            console.log(`  • ${status.toUpperCase()}: ${tasksArray.length}`)
          })
        }

        if (options.status) {
          const filteredTasks = tasks.filter((task: any) => task.status === options.status)
          console.log(`  • Tasks with status '${options.status}': ${filteredTasks.length}`)
        }

        if (totalTasks > 0) {
          console.log('\n🚀 Next Steps:')
          console.log('  • Use "codeguide task update <task_id> --status in_progress" to start a task')
          console.log('  • Use "codeguide task update <task_id> <ai_result>" to update a task')
        }
      } catch (error) {
        console.error(' Failed to fetch tasks')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  // task start - Start a task
  taskProgram
    .command('start')
    .description('Start a task')
    .argument('<task_id>', 'Task ID to start')
    .option('-v, --verbose', 'Verbose output')
    .action(async (taskId, options) => {
      try {
        if (options.verbose) {
          console.log(' Task Start Details:')
          console.log('   Task ID:', taskId)
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Initialize API service
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl || process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev',
          databaseApiKey: authApiKey,
        })

        // Check authentication
        try {
          await codeguide.usage.healthCheck()
          if (options.verbose) {
            console.log(' Authentication successful')
          }
        } catch (error) {
          console.error(' Authentication failed or API service is not available')
          console.error(' Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        console.log(' Starting task...')
        console.log(' Task ID:', taskId)

        // Update task to set status to in_progress (replacing start functionality)
        const response = await withLoadingAnimation(
          async () => {
            if (options.verbose) {
              console.log(' ')
              console.log('    /project-tasks/{task_id}')
              console.log('   Task ID:', taskId)
              console.log('   Setting status to: in_progress')
            }

            const request = {
              status: 'in_progress',
            }

            const response = await codeguide.tasks.updateTask(taskId, request)

            if (options.verbose) {
              console.log(' ')
              console.log('   ', response.status)
              console.log('   ', response.message)
              if (response.data && response.data.task) {
                console.log('   Task ', response.data.task.status)
              } else {
                console.log('   Response data:', JSON.stringify(response.data, null, 2))
              }
            }

            return response
          },
          'Starting task...',
          'Task started successfully',
          'Failed to start task'
        )

        console.log(' Task started successfully!')
        console.log(' ', response.status)
        console.log(' ', response.message)

        // Check if response has the expected structure
        if (response.data && response.data.task) {
          const task = response.data.task
          console.log('\n Task Details:')
          console.log(`   Title: ${task.title}`)
          console.log(`    ${getStatusIcon(task.status)} ${task.status}`)
          console.log(`   ID: ${task.id}`)
          if (task.description) {
            console.log(`    ${task.description}`)
          }
        } else {
          console.log('\n Task Details:')
          console.log('   ID: ', taskId)
          console.log('   Status: in_progress')
          if (options.verbose) {
            console.log('   Note: Full task details not available in response')
          }
        }

        console.log(
          ' Use "codeguide task update <task_id> <ai_result>" to update the task with AI results'
        )
      } catch (error) {
        console.error(' Failed to start task')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  // task update - Update a task
  taskProgram
    .command('update')
    .description('Update a task with AI results or other changes')
    .argument('<task_id>', 'Task ID to update')
    .argument('[ai_result]', 'AI result or completion notes')
    .option('--status <status>', 'Update task status (e.g., pending, in_progress, completed)')
    .option('--title <title>', 'Update task title')
    .option('--description <description>', 'Update task description')
    .option('-v, --verbose', 'Verbose output')
    .action(async (taskId, aiResult, options) => {
      try {
        if (options.verbose) {
          console.log(' Task Update Details:')
          console.log('   Task ID:', taskId)
          console.log('   AI Result:', aiResult || 'Not provided')
          console.log('   ', options.status || 'Not changing')
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Initialize API service
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl || process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev',
          databaseApiKey: authApiKey,
        })

        // Check authentication
        try {
          await codeguide.usage.healthCheck()
          if (options.verbose) {
            console.log(' Authentication successful')
          }
        } catch (error) {
          console.error(' Authentication failed or API service is not available')
          console.error(' Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        console.log('🔄 Updating task...')
        console.log(' Task ID:', taskId)

        // Update task
        const response = await withLoadingAnimation(
          async () => {
            if (options.verbose) {
              console.log(' ')
              console.log('    /project-tasks/{task_id}')
              console.log('   Task ID:', taskId)
              console.log('   AI Result:', aiResult || 'Not provided')
              console.log('   ', options.status || 'Not changing')
            }

            const request: any = {}
            if (aiResult) request.ai_result = aiResult
            if (options.status) request.status = options.status
            if (options.title) request.title = options.title
            if (options.description) request.description = options.description

            const response = await codeguide.tasks.updateTask(taskId, request)

            if (options.verbose) {
              console.log(' ')
              console.log('   ', response.status)
              console.log('   ', response.message)
              if (response.data && response.data.task) {
                console.log('   Task ', response.data.task.status)
              } else {
                console.log('   Response data:', JSON.stringify(response.data, null, 2))
              }
            }

            return response
          },
          'Updating task...',
          'Task updated successfully',
          'Failed to update task'
        )

        console.log(' Task updated successfully!')
        console.log(' ', response.status)
        console.log(' ', response.message)

        // Check if response has the expected structure
        if (response.data && response.data.task) {
          const task = response.data.task
          console.log('\n Updated Task Details:')
          console.log(`   Title: ${task.title}`)
          console.log(`    ${getStatusIcon(task.status)} ${task.status}`)
          console.log(`   ID: ${task.id}`)
          if (task.description) {
            console.log(`    ${task.description}`)
          }
        } else {
          console.log('\n Updated Task Details:')
          console.log('   ID: ', taskId)
          console.log('   Status: Updated successfully')
          if (options.verbose) {
            console.log('   Note: Full task details not available in response')
          }
        }

        console.log(' Use "codeguide task list" to see all tasks')
      } catch (error) {
        console.error(' Failed to update task')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  program
    .command('init')
    .description('Initialize current directory with CodeGuide CLI documentation files')
    .option('--project-title <title>', 'Project title (for generated content)')
    .option('--project-description <description>', 'Project description (for generated content)')
    .option('-v, --verbose', 'Verbose output')
    .action(async options => {
      try {
        const currentDir = process.cwd()

        if (options.verbose) {
          console.log(' CodeGuide Init Details:')
          console.log('   Current Directory:', currentDir)
          console.log('   Project Title:', options.projectTitle || 'Auto-detected')
          console.log('   Project ', options.projectDescription || 'Auto-generated')
        }

        console.log(' Initializing CodeGuide CLI in current directory...')

        // Auto-detect project title and description if not provided
        let projectTitle = options.projectTitle
        let projectDescription = options.projectDescription

        if (!projectTitle) {
          const projectName = path.basename(currentDir)
          projectTitle =
            projectName.charAt(0).toUpperCase() +
            projectName
              .slice(1)
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
        }

        if (!projectDescription) {
          projectDescription = `A ${projectTitle} project managed by CodeGuide CLI`
        }

        // Generate and save AGENTS.md
        const agentMdContent = generateAgentMdContent(projectTitle, projectDescription)
        const agentMdPath = path.join(currentDir, 'AGENTS.md')
        fs.writeFileSync(agentMdPath, agentMdContent, 'utf8')
        console.log(' Created: AGENTS.md')

        console.log('')
        console.log(' CodeGuide CLI initialization complete!')
        console.log(' Current Directory:', currentDir)
        console.log(' Project Title:', projectTitle)
        console.log('')
        console.log(' Files created:')
        console.log('   • AGENTS.md - AI agent guidelines and CLI usage instructions')
        console.log('')
        console.log(' Next steps:')
        console.log('   • Use "codeguide start" to create a new project')
        console.log('   • Use "codeguide generate" to generate documentation')
        console.log('   • Use "codeguide task list" to manage project tasks')
      } catch (error) {
        console.error(' Failed to initialize CodeGuide CLI')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  program
    .command('docs')
    .description('Set up documentation from a project ID')
    .argument('<project_id>', 'Project ID to download documentation from')
    .option('-d, --directory <directory>', 'Target directory (default: interactive prompt)')
    .option('-v, --verbose', 'Verbose output')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async (projectId, options) => {
      try {
        const currentDir = process.cwd()
        let targetDir: string
        let useCurrentDirectory = false

        if (options.verbose) {
          console.log(' Documentation Setup Details:')
          console.log('   Project ID:', projectId)
          console.log('   Current Directory:', currentDir)
        }

        // Determine target directory
        if (options.directory) {
          // Use specified directory from command line
          targetDir = options.directory
          useCurrentDirectory = targetDir === currentDir
          if (options.verbose) {
            console.log(' Using specified directory:', targetDir)
          }
        } else {
          // For interactive mode, we need to get project info first to ask the question
          // Get saved credentials
          const savedConfig = authStorage.getAuthConfig()

          // Check authentication
          const authApiKey = options.apiKey || savedConfig.apiKey
          if (!authApiKey) {
            console.error('Error: No API key found')
            console.error('Please login again to save your API key:')
            console.error('   codeguide login --api-key YOUR_API_KEY')
            console.error('   or use --api-key option to provide an API key')
            console.error('')
            console.error(
              'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
            )
            process.exit(1)
          }

          const tempCodeguide = new CodeGuide({
            baseUrl: options.apiUrl || savedConfig.apiUrl,
            databaseApiKey: authApiKey,
          })

          // Get project information for directory naming
          try {
            const projectInfo = await tempCodeguide.projects.getProjectById(projectId)
            console.log(' Project Title:', projectInfo.title)
            console.log(' Project ', projectInfo.description.substring(0, 100) + '...')

            // Interactive mode - ask user where they want to save docs
            console.log('')
            const readline = require('readline')
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            })

            const answer = await new Promise<string>(resolve => {
              rl.question(
                ' Do you want to add the docs to the current directory? (y/N): ',
                (answer: string) => {
                  rl.close()
                  resolve(answer.trim().toLowerCase())
                }
              )
            })

            useCurrentDirectory = answer === 'y' || answer === 'yes'

            if (useCurrentDirectory) {
              targetDir = currentDir
              console.log(' Using current directory:', targetDir)
            } else {
              // Create safe directory name from project title
              const safeDirName = toSafeDirectoryName(projectInfo.title)
              const uniqueDirName = createUniqueDirectory(currentDir, safeDirName)
              targetDir = path.join(currentDir, uniqueDirName)
              console.log(' Creating new directory:', targetDir)
            }
          } catch (error) {
            console.error(' Failed to fetch project information')
            console.error(' Please verify the project ID is correct')
            throw error
          }
        }

        // Validate target directory
        const validation = validateDirectory(targetDir)
        if (!validation.valid) {
          console.error(' Error:', validation.error)
          process.exit(1)
        }

        // Create target directory if it doesn't exist (for new directory mode)
        if (!useCurrentDirectory && !fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
          console.log(` Created target directory: ${targetDir}`)
        }

        // For non-interactive mode (when directory is specified), we need to authenticate and get project info
        let project
        if (options.directory) {
          // Get saved credentials
          const savedConfig = authStorage.getAuthConfig()

          // Check authentication
          const authApiKey = options.apiKey || savedConfig.apiKey
          if (!authApiKey) {
            console.error('Error: No API key found')
            console.error('Please login again to save your API key:')
            console.error('   codeguide login --api-key YOUR_API_KEY')
            console.error('   or use --api-key option to provide an API key')
            console.error('')
            console.error(
              'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
            )
            process.exit(1)
          }

          const codeguide = new CodeGuide({
            baseUrl: options.apiUrl || savedConfig.apiUrl,
            databaseApiKey: authApiKey,
          })

          console.log(' Checking authentication...')
          const isHealthy = await codeguide.isHealthy()
          if (!isHealthy) {
            console.error(' Error: Authentication failed or API service is not available')
            console.error(' Please login again with a valid API key:')
            console.error('   codeguide login')
            process.exit(1)
          }

          console.log(' Authentication successful')

          // Get project information
          try {
            project = await withLoadingAnimation(
              async () => {
                const response = await codeguide.projects.getProjectById(projectId)
                return response
              },
              'Fetching project information...',
              'Project information retrieved',
              'Failed to fetch project information'
            )
          } catch (error) {
            console.error(' Failed to fetch project information')
            console.error(' Please verify the project ID is correct')
            throw error
          }

          console.log(' Project Title:', project.title)
          console.log(' Project ', project.description.substring(0, 100) + '...')
        }

        console.log(' Setting up documentation from project...')
        console.log(' Project ID:', projectId)

        // Get saved credentials for the main operations
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl,
          databaseApiKey: authApiKey,
        })

        // For interactive mode, we already have project info, for non-interactive we need to get it
        if (!options.directory) {
          // Interactive mode - get project info again with the main codeguide instance
          try {
            project = await withLoadingAnimation(
              async () => {
                const response = await codeguide.projects.getProjectById(projectId)
                return response
              },
              'Fetching project information...',
              'Project information retrieved',
              'Failed to fetch project information'
            )
          } catch (error) {
            console.error(' Failed to fetch project information')
            console.error(' Please verify the project ID is correct')
            throw error
          }
        }

        // Create documentation directory in target directory
        const docsDir = path.join(targetDir, 'documentation')
        if (!fs.existsSync(docsDir)) {
          fs.mkdirSync(docsDir, { recursive: true })
          console.log(` Created documentation directory: ${docsDir}`)
        } else {
          console.log(` Using existing documentation directory: ${docsDir}`)
        }

        // Fetch project documents
        console.log(' Fetching project documents...')
        let documents
        try {
          documents = await withLoadingAnimation(
            async () => {
              const response = await codeguide.projects.getProjectDocuments(projectId, {
                current_version_only: true,
              })
              return response
            },
            'Fetching documents...',
            'Documents fetched successfully',
            'Failed to fetch documents'
          )
        } catch (error) {
          console.error(' Failed to fetch project documents')
          throw error
        }

        // Save documents to the documentation directory
        console.log('💾 Saving documents...')
        if (documents.data && Array.isArray(documents.data) && documents.data.length > 0) {
          documents.data.forEach((doc: any) => {
            // Skip implementation_plan.md files
            if (doc.custom_document_type === 'implementation_plan') {
              return
            }
            const safeDocName =
              doc.custom_document_type ||
              doc.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
            const documentContent = `# ${doc.title}

${doc.content}

---
**Document Details**
- **Project ID**: ${projectId}
- **Document ID**: ${doc.id}
- **Type**: ${doc.document_type}
- **Custom Type**: ${doc.custom_document_type}
- **Status**: ${doc.status}
- **Generated On**: ${new Date(doc.created_at).toISOString()}
- **Last Updated**: ${doc.updated_at ? new Date(doc.updated_at).toISOString() : 'N/A'}
`
            saveDocument(docsDir, safeDocName, documentContent)
          })

          console.log(` Saved ${documents.data.length} documents to ${docsDir}`)
        } else {
          console.log(`  No documents found for this project`)
        }

        // Create codeguide.json configuration file in target directory
        console.log('  Creating project configuration...')
        createCodeguideConfig(targetDir, projectId, project?.title || 'Project')

        // Generate and save AGENTS.md
        console.log(' Creating CLI documentation files...')
        const agentMdContent = generateAgentMdContent(
          project?.title || 'Project',
          project?.description || 'A project managed by CodeGuide CLI'
        )
        const agentMdPath = path.join(targetDir, 'AGENTS.md')
        fs.writeFileSync(agentMdPath, agentMdContent, 'utf8')
        console.log(' Created: AGENTS.md')

        console.log('')
        console.log(' Documentation setup complete!')
        console.log(` Target Directory: ${targetDir}`)
        console.log(` Documentation Folder: ${docsDir}`)
        console.log(`  Project Configuration: codeguide.json`)
        console.log(` Agent Guidelines: AGENTS.md`)
        console.log(` Project ID: ${projectId}`)
        console.log(' All documents have been saved to the documentation folder.')
        console.log(' View and manage tasks in the CodeGuide dashboard')
        console.log('')

        // Add cleanup instructions if a subdirectory was created
        if (!useCurrentDirectory) {
          console.log('🧹 Cleanup Instructions:')
          console.log(' Since this documentation was set up in a subdirectory, you may want to move the files to the project root:')
          console.log('')
          console.log('   1. Move essential files to the parent directory:')
          console.log('      mv documentation/ ../')
          console.log('      mv AGENTS.md ../')
          console.log('      mv codeguide.json ../')
          console.log('   2. Navigate to the parent directory:')
          console.log('      cd ..')
          console.log('   3. Remove the now-empty subdirectory:')
          console.log('      rmdir $(basename "' + targetDir + '")')
          console.log('')
          console.log('   This will give you a cleaner project structure with all files at the root.')
          console.log('')
        }

        console.log(' Next steps:')
        console.log('   • Read the documentation files to understand the project')
        console.log('   • Run "codeguide task list" to see project tasks')
        console.log('   • Use "codeguide task update <task_id> --status in_progress" to start working on tasks')
      } catch (error) {
        console.error(' Failed to set up documentation')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  program
    .command('tasks')
    .description('List tasks for a project')
    .option('--project-id <id>', 'Project ID (overrides codeguide.json)')
    .option('--status <status>', 'Filter by task status (e.g., pending, in_progress, completed)')
    .option('--task-group-id <id>', 'Filter by task group ID')
    .option('-v, --verbose', 'Verbose output')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async options => {
      try {
        const currentDir = process.cwd()

        // Get project ID from command line or codeguide.json
        let projectId = options.projectId
        if (!projectId) {
          projectId = getProjectIdFromConfig(currentDir)
          if (!projectId) {
            console.error(' No project ID found')
            console.error(
              ' Either specify --project-id or run this command in a directory with codeguide.json'
            )
            process.exit(1)
          }
        }

        if (options.verbose) {
          console.log('📋 Task List Details:')
          console.log('  • Project ID:', projectId)
          console.log('  • Current Directory:', currentDir)
          console.log('  • Status Filter:', options.status || 'All')
          console.log('  • Task Group Filter:', options.taskGroupId || 'All')
        }

        // Get saved credentials as highest priority
        const savedConfig = authStorage.getAuthConfig()

        // Check authentication first
        const authApiKey = options.apiKey || savedConfig.apiKey
        if (!authApiKey) {
          console.error('Error: No API key found')
          console.error('Please login again to save your API key:')
          console.error('   codeguide login --api-key YOUR_API_KEY')
          console.error('   or use --api-key option to provide an API key')
          console.error('')
          console.error(
            'Create an API key at: https://app.codeguide.dev/settings?tab=enhanced-api-keys'
          )
          process.exit(1)
        }

        // Initialize API service
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl || savedConfig.apiUrl || process.env.CODEGUIDE_API_URL || 'https://api.codeguide.dev',
          databaseApiKey: authApiKey,
        })

        // Check authentication
        try {
          await codeguide.usage.healthCheck()
          if (options.verbose) {
            console.log(' Authentication successful')
          }
        } catch (error) {
          console.error(' Authentication failed or API service is not available')
          console.error(' Please login again with a valid API key:')
          console.error('   codeguide login')
          process.exit(1)
        }

        // Get tasks by project
        const response = await withLoadingAnimation(
          async () => {
            if (options.verbose) {
              console.log('\nAPI Request Details:')
              console.log('  Endpoint: /project-tasks/by-project/{project_id}')
              console.log('  Project ID:', projectId)
              console.log('  Status Filter:', options.status || 'Not specified')
              console.log('  Task Group Filter:', options.taskGroupId || 'Not specified')
            }

            const request = {
              project_id: projectId,
              ...(options.status && { status: options.status }),
              ...(options.taskGroupId && { task_group_id: options.taskGroupId }),
            }

            const response = await codeguide.tasks.getTasksByProject(request)

            if (options.verbose) {
              const verboseTasks = Array.isArray(response.data) ? response.data : response.data?.tasks || []
              const verboseTaskGroups = response.data?.task_groups || []
              console.log('\nAPI Response Details:')
              console.log('  Status:', response.status)
              console.log('  Response Type:', Array.isArray(response.data) ? 'Direct Tasks Array' : 'Nested Structure')
              console.log('  Task Groups:', verboseTaskGroups.length)
              console.log('  Tasks:', verboseTasks.length)
            }

            return response
          },
          'Fetching tasks...',
          'Tasks fetched successfully',
          'Failed to fetch tasks'
        )

        // Handle different response structures
        const tasks = Array.isArray(response.data) ? response.data : response.data?.tasks || []
        const taskGroups = response.data?.task_groups || []

        // Group tasks by status for better organization
        const tasksByStatus = tasks.reduce(
          (acc: Record<string, any[]>, task: any) => {
            if (!acc[task.status]) {
              acc[task.status] = []
            }
            acc[task.status].push(task)
            return acc
          },
          {} as Record<string, any[]>
        )

        // Display tasks
        if (tasks.length > 0) {
          console.log('\n📋 Tasks:')

          // Display tasks by status
          Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
            const statusIcon = getStatusIcon(status)
            const tasksArray = statusTasks as any[]
            console.log(`\n${statusIcon} ${status.toUpperCase()} (${tasksArray.length}):`)
            tasksArray.forEach((task: any, index: number) => {
              console.log(`   ${index + 1}. ${task.title}`)
              if (task.priority) {
                console.log(`      Priority: ${task.priority.toUpperCase()}`)
              }
              console.log(`      ID: ${task.id}`)
              if (task.description) {
                console.log(`      Description: ${task.description}`)
              }
              if (task.created_at) {
                const createdDate = new Date(task.created_at)
                console.log(`      Created: ${isNaN(createdDate.getTime()) ? task.created_at : createdDate.toLocaleDateString()}`)
              }
              if (task.updated_at) {
                const updatedDate = new Date(task.updated_at)
                console.log(`      Updated: ${isNaN(updatedDate.getTime()) ? task.updated_at : updatedDate.toLocaleDateString()}`)
              }
              if (task.details) {
                console.log(`      Details: ${task.details}`)
              }
              if (task.parent_task_id) {
                console.log(`      Parent Task: ${task.parent_task_id}`)
              }
              if (task.ordinal !== undefined) {
                console.log(`      Order: ${task.ordinal}`)
              }
              if (options.verbose) {
                console.log(`      User ID: ${task.user_id}`)
                console.log(`      Task Group ID: ${task.task_group_id}`)
              }
            })
          })
        } else {
          console.log('\n📝 No tasks found')
          console.log('   Run "codeguide task generate" to create tasks for your project')
        }

        // Summary
        const totalTasks = tasks.length
        console.log('\n📊 Summary:')
        console.log(`   • Total Tasks: ${totalTasks}`)

        if (Object.keys(tasksByStatus).length > 1) {
          console.log('\n   Tasks by Status:')
          Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
            const tasksArray = statusTasks as any[]
            console.log(`   • ${status.toUpperCase()}: ${tasksArray.length}`)
          })
        }

        if (options.status) {
          const filteredTasks =
            response.data.tasks?.filter(task => task.status === options.status) || []
          console.log(`   Tasks with status '${options.status}': ${filteredTasks.length}`)
        }

        console.log(' Use "codeguide task" to generate new tasks for this project')
      } catch (error) {
        console.error(' Failed to fetch tasks')

        // Enhanced error logging
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as any
          console.error(' API Error Details:')
          console.error('   ', apiError.response?.status || 'Unknown')
          console.error('   Status Text:', apiError.response?.statusText || 'Unknown')
          console.error('   URL:', apiError.config?.url || 'Unknown')
          console.error('   Method:', apiError.config?.method || 'Unknown')

          if (apiError.response?.data) {
            console.error('   Response Data:', JSON.stringify(apiError.response.data, null, 2))
          }

          if (apiError.message) {
            console.error('   Error ', apiError.message)
          }
        } else if (error instanceof Error) {
          console.error(' Error Details:')
          console.error('   Type:', error.constructor.name)
          console.error('   ', error.message)
          if (options.verbose && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
          }
        } else {
          console.error(' Unknown Error:', JSON.stringify(error, null, 2))
        }

        process.exit(1)
      }
    })

  // Helper function to get status icons
  function getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return ''
      case 'in_progress':
      case 'in-progress':
        return '🔄'
      case 'pending':
        return '⏳'
      default:
        return ''
    }
  }
}
