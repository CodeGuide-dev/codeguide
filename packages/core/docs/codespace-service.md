# Codespace Service Documentation

This guide covers how to use the Codespace Service methods through the CodeGuide service for managing AI-powered coding tasks and workflows.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [Methods Overview](#methods-overview)
- [Detailed Method Documentation](#detailed-method-documentation)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Setup

### Installation

```bash
npm install @codeguide/core
```

### Basic Initialization

```typescript
import { CodeGuide } from '@codeguide/core'

// Initialize the CodeGuide service
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.dev',
  databaseApiKey: 'sk_your_database_api_key_here', // Recommended
  // Alternative authentication methods:
  // apiKey: 'your_legacy_api_key',
  // jwtToken: 'your_clerk_jwt_token',
  timeout: 30000,
})

// Access the codespace service
const codespace = codeguide.codespace
```

### Configuration Options

The `APIServiceConfig` interface accepts:

- `baseUrl` (required): API base URL
- `databaseApiKey`: Database API key (format: `sk_...`) - **Highest priority**
- `apiKey`: Legacy API key - **Medium priority**
- `jwtToken`: Clerk JWT token - **Lowest priority**
- `timeout`: Request timeout in milliseconds (optional)

## Authentication

The service supports multiple authentication methods with automatic priority handling:

1. **Database API Key** (recommended): `sk_...` format
2. **Legacy API Key**: Older API key format
3. **Clerk JWT Token**: JWT-based authentication

The service will automatically use the highest priority authentication method available.

## Methods Overview

The Codespace Service provides the following methods:

| Method                            | Description                            | Endpoint                               |
| --------------------------------- | -------------------------------------- | -------------------------------------- |
| `generateTaskTitle()`             | Generate a title from task description | `POST /codespace/generate-task-title`  |
| `createCodespaceTaskV2()`         | Create a new codespace task            | `POST /codespace/task`                 |
| `createBackgroundCodespaceTask()` | Create task in background              | `POST /codespace/task/background`      |
| `getCodespaceTask()`              | Get task by ID                         | `GET /codespace/task/{id}`             |
| `getCodespaceTasksByProject()`    | Get tasks for a project                | `GET /codespace/tasks/project/{id}`    |
| `getCodespaceTaskDetailed()`      | Get detailed task info                 | `GET /codespace/task/{id}/detailed`    |
| `getProjectTasksByCodespace()`    | Get project tasks by codespace         | `GET /project-tasks/by-codespace/{id}` |
| `getRelatedCodespaceTasks()`      | Get related tasks by parent ID         | `GET /codespace/tasks/related/{id}`    |
| `generateQuestionnaire()`         | Generate questionnaire for task        | `POST /codespace/generate-questionnaire` |
| `createCodespaceTask()`           | Create codespace task (legacy)        | `POST /codespace/create-task`          |
| `getCodespaceModels()`            | Get all codespace models              | `GET /api/codespace-models/models`     |
| `getCodespaceModel()`             | Get specific codespace model          | `GET /api/codespace-models/models/{id}` |
| `getLLMModelProviders()`          | Get all LLM model providers           | `GET /api/codespace-models/providers`  |
| `getLLMModelProvider()`           | Get specific LLM model provider       | `GET /api/codespace-models/providers/{id}` |
| `getModelsByProvider()`           | Get models by provider                | `GET /api/codespace-models/providers/{id}/models` |

## Detailed Method Documentation

### 1. generateTaskTitle()

Generates a concise title from a detailed task description using AI or fallback logic.

#### Signature

```typescript
async generateTaskTitle(request: GenerateTaskTitleRequest): Promise<GenerateTaskTitleResponse>
```

#### Parameters

- `request.task_description` (string, required): The full task description to generate title from

#### Response

```typescript
interface GenerateTaskTitleResponse {
  success: boolean
  title: string
  message: string
  fallback_used: boolean // true if AI generation failed and fallback was used
}
```

#### Example

```typescript
const response = await codespace.generateTaskTitle({
  task_description:
    'Create a user authentication system with login, registration, and password reset functionality using JWT tokens and bcrypt for password hashing',
})

console.log(response.title) // "User Authentication System"
console.log(response.fallback_used) // false if AI generated, true if fallback used
```

### 2. createCodespaceTaskV2()

Creates a new codespace task with complete workflow including PRD generation, task creation, and Claude Code integration.

#### Signature

```typescript
async createCodespaceTaskV2(request: CreateCodespaceTaskRequestV2): Promise<CreateCodespaceTaskResponseV2>
```

#### Parameters

```typescript
interface CreateCodespaceTaskRequestV2 {
  project_id: string // Required
  task_description: string // Required
  project_repository_id?: string // Optional
  title?: string // Optional
  branch?: string // Optional
  working_branch?: string // Optional
  base_branch?: string // Optional (default: "main")
  docs_url?: string // Optional
  model_api_keys?: ModelApiKey[] // Optional
  github_token?: string // Optional
  codespace_task_id?: string // Optional (for continuation)
  execution_mode?: 'implementation' | 'docs-only' | 'direct' // Optional (default: "implementation")
  model_name?: string // Optional
  starter_kit_repo?: string // Optional
}

interface ModelApiKey {
  model_name: string
  api_key: string
}
```

#### Response

```typescript
interface CreateCodespaceTaskResponseV2 {
  success: boolean
  task_id: string
  message: string
  status?: string
  created_at?: string
}
```

#### Example

```typescript
const response = await codespace.createCodespaceTaskV2({
  project_id: 'proj_123456',
  task_description: 'Add user profile page with avatar upload and bio editing',
  execution_mode: 'implementation',
  model_api_keys: [
    {
      model_name: 'claude-3-sonnet',
      api_key: 'your_api_key_here',
    },
  ],
  github_token: 'ghp_your_github_token',
})

console.log(`Task created with ID: ${response.task_id}`)
```

### 3. createBackgroundCodespaceTask()

Creates a codespace task that runs in the background, returning immediately with task details while work continues.

#### Signature

```typescript
async createBackgroundCodespaceTask(request: CreateBackgroundCodespaceTaskRequest): Promise<CreateBackgroundCodespaceTaskResponse>
```

#### Parameters

Same as `createCodespaceTaskV2()` - extends `CreateCodespaceTaskRequestV2`

#### Response

```typescript
interface CreateBackgroundCodespaceTaskResponse {
  success: boolean
  task_id: string
  job_id: string // Background job ID for status checking
  status: string
  message: string
  repository_connected: boolean
  mode: 'documentation' | 'implementation'
}
```

#### Example

```typescript
const response = await codespace.createBackgroundCodespaceTask({
  project_id: 'proj_123456',
  task_description: 'Implement real-time chat functionality',
  execution_mode: 'implementation',
})

console.log(`Background task started: ${response.job_id}`)
// Later check status with the job_id
```

### 4. getCodespaceTask()

Retrieves a codespace task by its ID with full details.

#### Signature

```typescript
async getCodespaceTask(codespaceTaskId: string): Promise<GetCodespaceTaskResponse>
```

#### Parameters

- `codespaceTaskId` (string, required): The ID of the codespace task to retrieve

#### Response

```typescript
interface GetCodespaceTaskResponse {
  status: string
  data: CodespaceTaskData
}

interface CodespaceTaskData {
  id: string
  codespace_task_id: string | null
  project_id: string
  project_repository_id: string
  user_id: string
  status: string
  progress: string
  created_at: string
  updated_at: string
  completed_at: string | null
  title: string
  task_description: string
  base_branch: string
  working_branch: string
  github_token_hash: string | null
  pull_request_url: string | null
  pull_request_number: number | null
  work_started_at: string | null
  work_completed_at: string | null
  estimated_completion_time: string | null
  ai_implementation_plan: string | null
  metadata: any
  model_id: string | null
  execution_mode: string
  context_data: any
  final_report_popup_state: string
  technical_document: TechnicalDocument | null
  model: any
  task_models: any[]
}
```

#### Example

```typescript
const response = await codespace.getCodespaceTask('task_789012')
const task = response.data

console.log(`Task: ${task.title}`)
console.log(`Status: ${task.status}`)
console.log(`Progress: ${task.progress}`)
console.log(`Created: ${task.created_at}`)

if (task.pull_request_url) {
  console.log(`PR: ${task.pull_request_url}`)
}
```

### 5. getCodespaceTasksByProject()

Retrieves all codespace tasks for a specific project with filtering and pagination support.

#### Signature

```typescript
async getCodespaceTasksByProject(params: GetCodespaceTasksByProjectRequest): Promise<GetCodespaceTasksByProjectResponse>
```

#### Parameters

```typescript
interface GetCodespaceTasksByProjectRequest {
  project_id: string // Required
  status?: 'completed' | 'failed' | 'in_progress' | 'created' | 'cancelled'
  limit?: number // Optional (default: 50)
  offset?: number // Optional (default: 0)
  sort_by?: string // Optional (default: "created_at")
  sort_order?: 'asc' | 'desc' // Optional (default: "desc")
}
```

#### Response

```typescript
interface GetCodespaceTasksByProjectResponse {
  status: string
  data: CodespaceTaskData[]
  total_count: number
  message: string
}
```

#### Example

```typescript
// Get all completed tasks for a project
const response = await codespace.getCodespaceTasksByProject({
  project_id: 'proj_123456',
  status: 'completed',
  limit: 20,
  sort_order: 'desc',
})

console.log(`Found ${response.total_count} completed tasks`)
response.data.forEach(task => {
  console.log(`- ${task.title} (${task.status})`)
})
```

### 6. getCodespaceTaskDetailed()

Retrieves comprehensive codespace task details including related project data, repository information, and usage statistics.

#### Signature

```typescript
async getCodespaceTaskDetailed(codespaceTaskId: string): Promise<CodespaceTaskDetailedResponse>
```

#### Parameters

- `codespaceTaskId` (string, required): The ID of the codespace task to retrieve detailed information for

#### Response

```typescript
interface CodespaceTaskDetailedResponse {
  status: string
  data: {
    task: CodespaceTaskData
    project: any // Project data structure
    repository: any // Repository data structure
    usage_summary: any // Usage statistics
  }
  message: string
}
```

#### Example

```typescript
const response = await codespace.getCodespaceTaskDetailed('task_789012')
const { task, project, repository, usage_summary } = response.data

console.log(`Task: ${task.title}`)
console.log(`Project: ${project.name}`)
console.log(`Repository: ${repository.repo_url}`)
console.log(`Usage: ${usage_summary.total_requests} requests`)
```

### 7. getProjectTasksByCodespace()

Retrieves project tasks associated with a specific codespace task.

#### Signature

```typescript
async getProjectTasksByCodespace(codespaceTaskId: string): Promise<GetProjectTasksByCodespaceResponse>
```

#### Parameters

- `codespaceTaskId` (string, required): The ID of the codespace task

#### Response

```typescript
interface GetProjectTasksByCodespaceResponse {
  status: string
  data: any[] // Array of project task objects
}
```

#### Example

```typescript
const response = await codespace.getProjectTasksByCodespace('task_789012')

console.log(`Found ${response.data.length} related project tasks`)
response.data.forEach(projectTask => {
  console.log(`- ${projectTask.name} (${projectTask.status})`)
})
```

### 8. getRelatedCodespaceTasks()

Retrieves codespace tasks that are related to a parent task ID, including model information and attachments.

#### Signature

```typescript
async getRelatedCodespaceTasks(params: GetRelatedCodespaceTasksRequest): Promise<CodespaceTasksListResponse>
```

#### Parameters

```typescript
interface GetRelatedCodespaceTasksRequest {
  parent_id: string // Required: The parent codespace task ID
  status?: 'completed' | 'failed' | 'in_progress' | 'created' | 'cancelled'
  limit?: number // Optional (default: 50)
  offset?: number // Optional (default: 0)
  sort_by?: string // Optional (default: "created_at")
  sort_order?: 'asc' | 'desc' // Optional (default: "desc")
}
```

#### Response

```typescript
interface CodespaceTasksListResponse {
  status: string
  data: CodespaceTaskInDBWithModel[]
  total_count: number
  message: string
}

interface CodespaceTaskInDBWithModel {
  id: string
  codespace_task_id: string
  project_id: string
  user_id: string
  status: string
  progress: string
  created_at: string
  updated_at?: string
  completed_at?: string
  title: string
  task_description: string
  metadata?: any
  model_id?: string
  execution_mode?: string
  context_data?: any
  model?: CodespaceModelWithProvider // Model information
  task_models?: CodespaceTaskModelInDB[] // Associated task models
  attachments?: AttachmentResponse[] // Associated attachments
}

interface CodespaceModelWithProvider {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
  provider?: LLMModelProviderInDB
}

interface CodespaceTaskModelInDB {
  id: string
  created_at: string
  codespace_task_id: string
  model_id: string
  model_name?: string
  model_key?: string
  provider_id?: string
  provider_name?: string
  execution_mode?: string
}

interface AttachmentResponse {
  id: string
  filename: string
  file_data: string
  mime_type: string
  file_size: number
  description?: string
  created_at: string
}
```

#### Example

```typescript
// Get all related tasks for a parent task
const response = await codespace.getRelatedCodespaceTasks({
  parent_id: 'parent_task_uuid_here',
  status: 'in_progress',
  limit: 10,
  sort_by: 'created_at',
  sort_order: 'desc'
})

console.log(`Found ${response.total_count} related tasks`)
response.data.forEach(task => {
  console.log(`- ${task.title} (${task.status})`)
  console.log(`  Model: ${task.model?.name || 'Default'}`)
  console.log(`  Attachments: ${task.attachments?.length || 0}`)

  if (task.task_models && task.task_models.length > 0) {
    console.log(`  Task Models: ${task.task_models.map(tm => tm.model_name).join(', ')}`)
  }
})

// Get completed related tasks with pagination
const completedTasks = await codespace.getRelatedCodespaceTasks({
  parent_id: 'parent_task_uuid_here',
  status: 'completed',
  limit: 5,
  offset: 0
})

console.log(`Completed related tasks: ${completedTasks.data.length} of ${completedTasks.total_count}`)
```

### 9. generateQuestionnaire()

Generates a questionnaire for a task description to gather additional context.

#### Signature

```typescript
async generateQuestionnaire(request: CodespaceQuestionnaireRequest): Promise<CodespaceQuestionnaireResponse>
```

#### Parameters

```typescript
interface CodespaceQuestionnaireRequest {
  task_description: string                    // Required: Task description
  project_context?: string                    // Optional: Project context
  repository_info?: {                        // Optional: Repository information
    name?: string
    description?: string
  }
  attachments?: Attachment[]                  // Optional: File attachments
}

interface Attachment {
  filename: string
  file_data: string      // Base64 encoded file data
  mime_type: string
  file_size: number
  description?: string
}
```

#### Response

```typescript
interface CodespaceQuestionnaireResponse {
  success: boolean
  questions: string[]     // Array of generated questions
  message: string
}
```

#### Example

```typescript
const response = await codespace.generateQuestionnaire({
  task_description: 'Implement user authentication system',
  project_context: 'React application with Node.js backend',
  repository_info: {
    name: 'my-app',
    description: 'Full-stack web application',
  },
})

console.log('Generated questions:')
response.questions.forEach((question, index) => {
  console.log(`${index + 1}. ${question}`)
})
```

### 9. createCodespaceTask()

Creates a codespace task using the legacy endpoint (for backward compatibility).

#### Signature

```typescript
async createCodespaceTask(request: CreateCodespaceTaskRequest): Promise<CreateCodespaceTaskResponse>
```

#### Parameters

```typescript
interface CreateCodespaceTaskRequest {
  title: string                    // Required: Task title
  description: string              // Required: Task description
  conversation_id?: string         // Optional: Conversation ID
}
```

#### Response

```typescript
interface CreateCodespaceTaskResponse {
  success: boolean
  task_id: string
  message: string
}
```

#### Example

```typescript
const response = await codespace.createCodespaceTask({
  title: 'User Authentication',
  description: 'Implement login and registration',
})

console.log(`Task created: ${response.task_id}`)
```

## Codespace Models Methods

The Codespace Service also provides methods for managing LLM models and providers used in codespace tasks.

### 10. getCodespaceModels()

Retrieves all available codespace models with optional filtering.

#### Signature

```typescript
async getCodespaceModels(query?: GetCodespaceModelsQuery): Promise<GetCodespaceModelsResponse>
```

#### Parameters

```typescript
interface GetCodespaceModelsQuery {
  provider_id?: string        // Optional: Filter by provider ID
  execution_mode?: string     // Optional: Filter by execution mode
}
```

#### Response

```typescript
interface GetCodespaceModelsResponse extends Array<CodespaceModelWithProvider> {}

interface CodespaceModelWithProvider {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
  provider?: LLMModelProviderInDB
}

interface LLMModelProviderInDB {
  id: string
  created_at: string
  name?: string
  key?: string
  logo_src?: string
}
```

#### Example

```typescript
// Get all models
const allModels = await codespace.getCodespaceModels()

// Filter by provider
const openaiModels = await codespace.getCodespaceModels({
  provider_id: 'provider_openai_id',
})

// Filter by execution mode
const implementationModels = await codespace.getCodespaceModels({
  execution_mode: 'implementation',
})

console.log(`Found ${allModels.length} total models`)
allModels.forEach(model => {
  console.log(`- ${model.name} (${model.provider?.name})`)
})
```

### 11. getCodespaceModel()

Retrieves a specific codespace model by ID.

#### Signature

```typescript
async getCodespaceModel(modelId: string): Promise<GetCodespaceModelResponse>
```

#### Parameters

- `modelId` (string, required): The UUID of the model

#### Returns

- `Promise<GetCodespaceModelResponse>`: Model object with provider information

#### Example

```typescript
const model = await codespace.getCodespaceModel('model_uuid_here')

console.log(`Model: ${model.name}`)
console.log(`Provider: ${model.provider?.name}`)
console.log(`Execution Mode: ${model.execution_mode}`)
console.log(`Base URL: ${model.base_url}`)
```

### 12. getLLMModelProviders()

Retrieves all available LLM model providers.

#### Signature

```typescript
async getLLMModelProviders(): Promise<GetLLMModelProvidersResponse>
```

#### Returns

```typescript
interface GetLLMModelProvidersResponse extends Array<LLMModelProviderInDB> {}
```

#### Example

```typescript
const providers = await codespace.getLLMModelProviders()

console.log(`Found ${providers.length} providers:`)
providers.forEach(provider => {
  console.log(`- ${provider.name} (${provider.key})`)
})
```

### 13. getLLMModelProvider()

Retrieves a specific LLM model provider by ID.

#### Signature

```typescript
async getLLMModelProvider(providerId: string): Promise<GetLLMModelProviderResponse>
```

#### Parameters

- `providerId` (string, required): The UUID of the provider

#### Returns

- `Promise<GetLLMModelProviderResponse>`: Provider object

#### Example

```typescript
const provider = await codespace.getLLMModelProvider('provider_uuid_here')

console.log(`Provider: ${provider.name}`)
console.log(`Key: ${provider.key}`)
if (provider.logo_src) {
  console.log(`Logo: ${provider.logo_src}`)
}
```

### 14. getModelsByProvider()

Retrieves all models for a specific provider.

#### Signature

```typescript
async getModelsByProvider(providerId: string): Promise<GetModelsByProviderResponse>
```

#### Parameters

- `providerId` (string, required): The UUID of the provider

#### Returns

```typescript
interface GetModelsByProviderResponse extends Array<CodespaceModelInDB> {}
```

#### Example

```typescript
const openaiModels = await codespace.getModelsByProvider('provider_openai_id')

console.log(`Found ${openaiModels.length} OpenAI models:`)
openaiModels.forEach(model => {
  console.log(`- ${model.name} (${model.execution_mode})`)
})
```

## Error Handling

All methods throw errors for various failure conditions. Common error types include:

### Validation Errors

```typescript
try {
  await codespace.createCodespaceTaskV2({})
} catch (error) {
  console.error(error.message) // "project_id is required"
}
```

### Network/Server Errors

```typescript
try {
  await codespace.getCodespaceTask('invalid_id')
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Task not found')
  } else if (error.response?.status === 401) {
    console.error('Unauthorized - check your API credentials')
  } else {
    console.error('Network error:', error.message)
  }
}
```

### Timeout Errors

```typescript
try {
  await codespace.createCodespaceTaskV2(largeRequest)
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.error('Request timed out. Consider using background task creation.')
  }
}
```

## Complete Examples

### Example 1: Complete Task Workflow

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.dev',
  databaseApiKey: process.env.CODEGUIDE_API_KEY,
})

async function completeTaskWorkflow() {
  try {
    // 1. Generate a title from description
    const titleResponse = await codeguide.codespace.generateTaskTitle({
      task_description:
        'Implement a REST API for user management with CRUD operations, validation, and authentication middleware',
    })

    console.log(`Generated title: ${titleResponse.title}`)

    // 2. Create the task
    const taskResponse = await codeguide.codespace.createCodespaceTaskV2({
      project_id: 'proj_123456',
      task_description:
        'Implement a REST API for user management with CRUD operations, validation, and authentication middleware',
      title: titleResponse.title,
      execution_mode: 'implementation',
      model_api_keys: [
        {
          model_name: 'claude-3-sonnet',
          api_key: process.env.CLAUDE_API_KEY,
        },
      ],
    })

    console.log(`Task created: ${taskResponse.task_id}`)

    // 3. Monitor task progress
    const checkProgress = async () => {
      const task = await codeguide.codespace.getCodespaceTask(taskResponse.task_id)
      console.log(`Status: ${task.data.status} - Progress: ${task.data.progress}`)

      if (task.data.status === 'completed') {
        console.log(`Task completed! PR: ${task.data.pull_request_url}`)
        return
      }

      // Check again in 30 seconds
      setTimeout(checkProgress, 30000)
    }

    checkProgress()
  } catch (error) {
    console.error('Workflow failed:', error.message)
  }
}

completeTaskWorkflow()
```

### Example 2: Background Task Processing

```typescript
async function backgroundTaskExample() {
  try {
    // Create background task
    const response = await codeguide.codespace.createBackgroundCodespaceTask({
      project_id: 'proj_123456',
      task_description: 'Add comprehensive test suite for existing authentication module',
      execution_mode: 'implementation',
    })

    console.log(`Background task started: ${response.job_id}`)

    // Poll for completion (in real app, use webhooks or proper job queue)
    const pollStatus = async () => {
      try {
        const task = await codeguide.codespace.getCodespaceTask(response.task_id)

        console.log(`Status: ${task.data.status}`)

        if (['completed', 'failed'].includes(task.data.status)) {
          console.log(
            `Task ${task.data.status === 'completed' ? 'completed successfully' : 'failed'}`
          )
          return
        }

        setTimeout(pollStatus, 10000) // Poll every 10 seconds
      } catch (error) {
        console.error('Error checking status:', error.message)
      }
    }

    pollStatus()
  } catch (error) {
    console.error('Background task creation failed:', error.message)
  }
}
```

### Example 3: Project Task Management

```typescript
async function projectTaskManagement() {
  const projectId = 'proj_123456'

  try {
    // Get all tasks for the project
    const tasksResponse = await codeguide.codespace.getCodespaceTasksByProject({
      project_id: projectId,
      limit: 100,
      sort_order: 'desc',
    })

    console.log(`Project has ${tasksResponse.total_count} total tasks`)

    // Group tasks by status
    const tasksByStatus = tasksResponse.data.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    console.log('Tasks by status:', tasksByStatus)

    // Get detailed info for the most recent task
    if (tasksResponse.data.length > 0) {
      const latestTask = tasksResponse.data[0]
      const detailedResponse = await codeguide.codespace.getCodespaceTaskDetailed(latestTask.id)

      console.log(`Latest task: ${detailedResponse.data.task.title}`)
      console.log(`Project: ${detailedResponse.data.project.name}`)
      console.log(`Repository: ${detailedResponse.data.repository?.repo_url || 'No repository'}`)
    }
  } catch (error) {
    console.error('Project task management failed:', error.message)
  }
}
```

## Best Practices

1. **Use Background Tasks** for long-running operations to avoid timeouts
2. **Implement Proper Error Handling** with try-catch blocks and status code checking
3. **Cache Task Data** when possible to reduce API calls
4. **Use Webhooks** in production for real-time task status updates
5. **Validate Input** before making API calls to avoid unnecessary requests
6. **Handle Timeouts** appropriately and implement retry logic when needed
7. **Use Specific Query Parameters** for filtering and pagination to improve performance

## Type Exports

The package exports the following types for TypeScript users:

```typescript
import type {
  CreateCodespaceTaskRequest,
  CreateCodespaceTaskResponse,
  CreateCodespaceTaskRequestV2,
  CreateCodespaceTaskResponseV2,
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  ModelApiKey,
  Attachment,
  GetCodespaceTaskResponse,
  CodespaceTaskData,
  TechnicalDocument,
  GetProjectTasksByCodespaceResponse,
  GetCodespaceTasksByProjectRequest,
  GetCodespaceTasksByProjectResponse,
  CodespaceTaskDetailedResponse,
  CodespaceQuestionnaireRequest,
  CodespaceQuestionnaireResponse,
  GetRelatedCodespaceTasksRequest,
  CodespaceTasksListResponse,
  CodespaceTaskInDBWithModel,
  AttachmentResponse,
  CodespaceTaskModelInDB,
  GetCodespaceModelsQuery,
  GetCodespaceModelsResponse,
  GetCodespaceModelResponse,
  GetLLMModelProvidersResponse,
  GetLLMModelProviderResponse,
  GetModelsByProviderResponse,
} from '@codeguide/core'
```

## Related Documentation

- [Codespace Models](./codespace-models.md) - Detailed documentation on codespace models and providers
- [Projects Service](./projects-service.md) - Project management
- [CodeGuide Client](./codeguide-client.md) - Client initialization

For more information, visit the [API documentation](https://docs.codeguide.dev) or check the [GitHub repository](https://github.com/codeguide/cli).
