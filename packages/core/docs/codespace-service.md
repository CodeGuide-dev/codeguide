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
  timeout: 30000
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

| Method | Description | Endpoint |
|--------|-------------|----------|
| `generateTaskTitle()` | Generate a title from task description | `POST /codespace/generate-task-title` |
| `createCodespaceTaskV2()` | Create a new codespace task | `POST /codespace/task` |
| `createBackgroundCodespaceTask()` | Create task in background | `POST /codespace/task/background` |
| `getCodespaceTask()` | Get task by ID | `GET /codespace/task/{id}` |
| `getCodespaceTasksByProject()` | Get tasks for a project | `GET /codespace/tasks/project/{id}` |
| `getCodespaceTaskDetailed()` | Get detailed task info | `GET /codespace/task/{id}/detailed` |
| `getProjectTasksByCodespace()` | Get project tasks by codespace | `GET /project-tasks/by-codespace/{id}` |

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
  task_description: "Create a user authentication system with login, registration, and password reset functionality using JWT tokens and bcrypt for password hashing"
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
  project_id: string                    // Required
  task_description: string              // Required
  project_repository_id?: string        // Optional
  title?: string                        // Optional
  branch?: string                       // Optional
  working_branch?: string               // Optional
  base_branch?: string                  // Optional (default: "main")
  docs_url?: string                     // Optional
  model_api_keys?: ModelApiKey[]        // Optional
  github_token?: string                 // Optional
  codespace_task_id?: string            // Optional (for continuation)
  execution_mode?: 'implementation' | 'docs-only'  // Optional (default: "implementation")
  model_name?: string                   // Optional
  starter_kit_repo?: string             // Optional
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
  project_id: "proj_123456",
  task_description: "Add user profile page with avatar upload and bio editing",
  execution_mode: "implementation",
  model_api_keys: [
    {
      model_name: "claude-3-sonnet",
      api_key: "your_api_key_here"
    }
  ],
  github_token: "ghp_your_github_token"
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
  job_id: string      // Background job ID for status checking
  status: string
  message: string
  repository_connected: boolean
  mode: 'documentation' | 'implementation'
}
```

#### Example
```typescript
const response = await codespace.createBackgroundCodespaceTask({
  project_id: "proj_123456",
  task_description: "Implement real-time chat functionality",
  execution_mode: "implementation"
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
const response = await codespace.getCodespaceTask("task_789012")
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
  project_id: string    // Required
  status?: 'completed' | 'failed' | 'in_progress' | 'created' | 'cancelled'
  limit?: number        // Optional (default: 50)
  offset?: number       // Optional (default: 0)
  sort_by?: string      // Optional (default: "created_at")
  sort_order?: 'asc' | 'desc'  // Optional (default: "desc")
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
  project_id: "proj_123456",
  status: "completed",
  limit: 20,
  sort_order: "desc"
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
    project: any              // Project data structure
    repository: any           // Repository data structure
    usage_summary: any        // Usage statistics
  }
  message: string
}
```

#### Example
```typescript
const response = await codespace.getCodespaceTaskDetailed("task_789012")
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
  data: any[]  // Array of project task objects
}
```

#### Example
```typescript
const response = await codespace.getProjectTasksByCodespace("task_789012")

console.log(`Found ${response.data.length} related project tasks`)
response.data.forEach(projectTask => {
  console.log(`- ${projectTask.name} (${projectTask.status})`)
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
  await codespace.getCodespaceTask("invalid_id")
} catch (error) {
  if (error.response?.status === 404) {
    console.error("Task not found")
  } else if (error.response?.status === 401) {
    console.error("Unauthorized - check your API credentials")
  } else {
    console.error("Network error:", error.message)
  }
}
```

### Timeout Errors
```typescript
try {
  await codespace.createCodespaceTaskV2(largeRequest)
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.error("Request timed out. Consider using background task creation.")
  }
}
```

## Complete Examples

### Example 1: Complete Task Workflow

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.dev',
  databaseApiKey: process.env.CODEGUIDE_API_KEY
})

async function completeTaskWorkflow() {
  try {
    // 1. Generate a title from description
    const titleResponse = await codeguide.codespace.generateTaskTitle({
      task_description: "Implement a REST API for user management with CRUD operations, validation, and authentication middleware"
    })

    console.log(`Generated title: ${titleResponse.title}`)

    // 2. Create the task
    const taskResponse = await codeguide.codespace.createCodespaceTaskV2({
      project_id: "proj_123456",
      task_description: "Implement a REST API for user management with CRUD operations, validation, and authentication middleware",
      title: titleResponse.title,
      execution_mode: "implementation",
      model_api_keys: [
        {
          model_name: "claude-3-sonnet",
          api_key: process.env.CLAUDE_API_KEY
        }
      ]
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
    console.error("Workflow failed:", error.message)
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
      project_id: "proj_123456",
      task_description: "Add comprehensive test suite for existing authentication module",
      execution_mode: "implementation"
    })

    console.log(`Background task started: ${response.job_id}`)

    // Poll for completion (in real app, use webhooks or proper job queue)
    const pollStatus = async () => {
      try {
        const task = await codeguide.codespace.getCodespaceTask(response.task_id)

        console.log(`Status: ${task.data.status}`)

        if (['completed', 'failed'].includes(task.data.status)) {
          console.log(`Task ${task.data.status === 'completed' ? 'completed successfully' : 'failed'}`)
          return
        }

        setTimeout(pollStatus, 10000) // Poll every 10 seconds
      } catch (error) {
        console.error("Error checking status:", error.message)
      }
    }

    pollStatus()

  } catch (error) {
    console.error("Background task creation failed:", error.message)
  }
}
```

### Example 3: Project Task Management

```typescript
async function projectTaskManagement() {
  const projectId = "proj_123456"

  try {
    // Get all tasks for the project
    const tasksResponse = await codeguide.codespace.getCodespaceTasksByProject({
      project_id: projectId,
      limit: 100,
      sort_order: "desc"
    })

    console.log(`Project has ${tasksResponse.total_count} total tasks`)

    // Group tasks by status
    const tasksByStatus = tasksResponse.data.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    console.log("Tasks by status:", tasksByStatus)

    // Get detailed info for the most recent task
    if (tasksResponse.data.length > 0) {
      const latestTask = tasksResponse.data[0]
      const detailedResponse = await codeguide.codespace.getCodespaceTaskDetailed(latestTask.id)

      console.log(`Latest task: ${detailedResponse.data.task.title}`)
      console.log(`Project: ${detailedResponse.data.project.name}`)
      console.log(`Repository: ${detailedResponse.data.repository?.repo_url || 'No repository'}`)
    }

  } catch (error) {
    console.error("Project task management failed:", error.message)
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
  CreateBackgroundCodespaceTaskRequest,
  CreateBackgroundCodespaceTaskResponse,
  ModelApiKey,
  GetCodespaceTaskResponse,
  CodespaceTaskData,
  TechnicalDocument,
  GetProjectTasksByCodespaceResponse,
  GetCodespaceTasksByProjectRequest,
  GetCodespaceTasksByProjectResponse,
  CodespaceTaskDetailedResponse
} from '@codeguide/core'
```

For more information, visit the [API documentation](https://docs.codeguide.dev) or check the [GitHub repository](https://github.com/codeguide/cli).