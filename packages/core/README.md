# @codeguide/core

The core package for CodeGuide with programmatic API access. This package provides TypeScript interfaces and services for integrating CodeGuide functionality into your applications.

## Features

- 🔑 **API Key Management**: Full CRUD operations for API keys
- 📝 **Project Management**: Create and manage projects programmatically
- 🎯 **Task Management**: Organize and track development tasks
- 📊 **Usage Analytics**: Monitor API usage and credits
- 🔍 **Repository Analysis**: Analyze code repositories
- 🎨 **Code Generation**: Generate code with AI assistance
- 🔐 **Multiple Authentication**: Support for various auth methods
- 🛡️ **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install @codeguide/core@0.0.11
```

## Quick Start

### Basic Usage

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key'
})

// Get all API keys
const keysResponse = await codeguide.apiKeyEnhanced.getAllApiKeys()
console.log(`Found ${keysResponse.data.length} API keys`)

// Create a new API key
const newKey = await codeguide.apiKeyEnhanced.createApiKey({
  name: 'My Application'
})
console.log(`Created key: ${newKey.data.api_key}`)
```

### API Key Management

```typescript
import {
  CodeGuide,
  ApiKeyListResponse,
  CreateApiKeyRequest
} from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key'
})

// List all API keys
const keysResponse: ApiKeyListResponse = await codeguide.apiKeyEnhanced.getAllApiKeys()

// Check if you can create new keys
const permission = await codeguide.apiKeyEnhanced.checkApiKeyPermission()
if (permission.data.can_create) {
  console.log('You can create new API keys')
}

// Create a new key
const createRequest: CreateApiKeyRequest = {
  name: 'Production Application'
}
const newKey = await codeguide.apiKeyEnhanced.createApiKey(createRequest)

// Revoke a key
await codeguide.apiKeyEnhanced.revokeApiKey('key-id-123')
```

### Project Management

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key'
})

// Create a new project
const project = await codeguide.projects.createProject({
  title: 'My Web Application',
  description: 'A modern web app built with React'
})

// Get project details
const projectDetails = await codeguide.projects.getProject(project.id)

// List all projects
const projects = await codeguide.projects.getAllProjects()
```

### Task Management

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key'
})

// Generate tasks for a project
const tasks = await codeguide.tasks.generateTasks({
  project_id: 'project-id-123',
  context: 'Building a React application with TypeScript'
})

// Get all tasks for a project
const projectTasks = await codeguide.tasks.getProjectTasks('project-id-123')

// Update task status
await codeguide.tasks.updateTask('task-id-123', {
  status: 'in_progress',
  notes: 'Started working on authentication module'
})
```

## Authentication

The CodeGuide client supports multiple authentication methods with automatic priority handling:

### 1. Database API Key (Highest Priority)

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key'
})
```

### 2. Legacy API Key + User ID

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  apiKey: 'your_api_key',
  userId: 'your_user_id'
})
```

### 3. Clerk JWT Token

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  jwtToken: 'your_jwt_token'
})
```

### Automatic Fallback

The client automatically falls back through authentication methods:

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_key',        // Will try this first
  apiKey: 'legacy_key',             // Fallback if database key fails
  userId: 'user_id',                // Required for legacy auth
  jwtToken: 'jwt_token'             // Final fallback
})
```

## API Reference

### ApiKeyEnhancedService

#### getAllApiKeys()
```typescript
async getAllApiKeys(): Promise<ApiKeyListResponse>
```
Get all API keys for the authenticated user.

**Returns:** `Promise<ApiKeyListResponse>`

**Example:**
```typescript
const response = await codeguide.apiKeyEnhanced.getAllApiKeys()
console.log(response.data) // Array of ApiKey objects
```

#### createApiKey(request)
```typescript
async createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse>
```
Create a new API key.

**Parameters:**
- `request.name` (string): Name for the new API key

**Returns:** `Promise<CreateApiKeyResponse>`

**Example:**
```typescript
const response = await codeguide.apiKeyEnhanced.createApiKey({
  name: 'My Application'
})
console.log(response.data.api_key) // The new API key
```

#### revokeApiKey(apiKeyId)
```typescript
async revokeApiKey(apiKeyId: string): Promise<RevokeApiKeyResponse>
```
Revoke an API key by ID.

**Parameters:**
- `apiKeyId` (string): ID of the API key to revoke

**Returns:** `Promise<RevokeApiKeyResponse>`

#### checkApiKeyPermission()
```typescript
async checkApiKeyPermission(): Promise<ApiKeyPermissionResponse>
```
Check if the user can create new API keys.

**Returns:** `Promise<ApiKeyPermissionResponse>`

### ProjectService

#### createProject(request)
```typescript
async createProject(request: CreateProjectRequest): Promise<ProjectResponse>
```
Create a new project.

#### getProject(projectId)
```typescript
async getProject(projectId: string): Promise<ProjectResponse>
```
Get project details by ID.

#### getAllProjects()
```typescript
async getAllProjects(): Promise<ProjectsListResponse>
```
Get all projects for the authenticated user.

### TaskService

#### generateTasks(request)
```typescript
async generateTasks(request: GenerateTasksRequest): Promise<TasksResponse>
```
Generate tasks for a project.

#### getProjectTasks(projectId)
```typescript
async getProjectTasks(projectId: string): Promise<TasksResponse>
```
Get all tasks for a project.

#### updateTask(taskId, update)
```typescript
async updateTask(taskId: string, update: UpdateTaskRequest): Promise<TaskResponse>
```
Update task status and notes.

## Types

### ApiKey
```typescript
interface ApiKey {
  id: string
  key: string           // Full API key string
  user_id: string
  name: string
  created_at: string
  expires_at?: string
  is_active: boolean
  metadata?: Record<string, any>
}
```

### ApiKeyListResponse
```typescript
interface ApiKeyListResponse {
  status: string
  data: ApiKey[]
}
```

### CreateApiKeyRequest
```typescript
interface CreateApiKeyRequest {
  name: string
}
```

### CreateApiKeyResponse
```typescript
interface CreateApiKeyResponse {
  status: string
  data: {
    api_key: string
    id: string
    name: string
    created_at: string
    expires_at?: string
    is_active: boolean
    metadata?: Record<string, any>
  }
  message?: string
}
```

### APIServiceConfig
```typescript
interface APIServiceConfig {
  baseUrl: string
  databaseApiKey?: string    // Highest priority
  apiKey?: string           // Legacy API key
  userId?: string           // Required for legacy auth
  jwtToken?: string         // Clerk JWT token
  timeout?: number          // Default: 3600000 (1 hour)
}
```

## Error Handling

The client provides detailed error information:

```typescript
try {
  const keys = await codeguide.apiKeyEnhanced.getAllApiKeys()
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed:', error.message)
  } else if (error.message.includes('403')) {
    console.error('Permission denied:', error.message)
  } else if (error.message.includes('429')) {
    console.error('Rate limited:', error.message)
  } else {
    console.error('API error:', error.message)
  }
}
```

## Configuration

### Timeout Configuration

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key',
  timeout: 1800000 // 30 minutes
})
```

### Verbose Logging

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key'
}, {
  verbose: true // Enable detailed logging
})
```

## Advanced Usage

### Custom Headers

The BaseService allows you to intercept and modify requests:

```typescript
// Access the underlying axios instance
const client = codeguide.apiKeyEnhanced.client

// Add custom headers
client.interceptors.request.use(config => {
  config.headers['X-Custom-Header'] = 'value'
  return config
})
```

### Response Interceptors

```typescript
// Add custom response handling
client.interceptors.response.use(
  response => response,
  error => {
    // Custom error handling
    console.error('API Error:', error.response?.data)
    return Promise.reject(error)
  }
)
```

## Examples

### Complete API Key Management Flow

```typescript
import { CodeGuide } from '@codeguide/core'

async function manageApiKeys() {
  const codeguide = new CodeGuide({
    baseUrl: 'https://api.codeguide.ai',
    databaseApiKey: 'sk_your_key'
  })

  try {
    // Check permissions
    const permission = await codeguide.apiKeyEnhanced.checkApiKeyPermission()
    if (!permission.data.can_create) {
      console.log('Cannot create new keys:', permission.data.reason)
      return
    }

    // List current keys
    const currentKeys = await codeguide.apiKeyEnhanced.getAllApiKeys()
    console.log(`Current keys: ${currentKeys.data.length}`)

    // Create new key
    const newKey = await codeguide.apiKeyEnhanced.createApiKey({
      name: 'Production Application'
    })
    console.log('Created key:', newKey.data.api_key)

    // Revoke old key if needed
    if (currentKeys.data.length > 5) {
      await codeguide.apiKeyEnhanced.revokeApiKey(currentKeys.data[0].id)
      console.log('Revoked oldest key')
    }

  } catch (error) {
    console.error('API key management failed:', error.message)
  }
}
```

### Project Setup with Tasks

```typescript
import { CodeGuide } from '@codeguide/core'

async function setupProject() {
  const codeguide = new CodeGuide({
    baseUrl: 'https://api.codeguide.ai',
    databaseApiKey: 'sk_your_key'
  })

  try {
    // Create project
    const project = await codeguide.projects.createProject({
      title: 'E-commerce Platform',
      description: 'Modern e-commerce solution with React and Node.js'
    })

    // Generate tasks
    const tasks = await codeguide.tasks.generateTasks({
      project_id: project.id,
      context: 'Building a full-stack e-commerce platform'
    })

    console.log(`Created project with ${tasks.data.length} tasks`)

    // Start first task
    if (tasks.data.length > 0) {
      await codeguide.tasks.updateTask(tasks.data[0].id, {
        status: 'in_progress',
        notes: 'Starting project setup'
      })
    }

  } catch (error) {
    console.error('Project setup failed:', error.message)
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- **Documentation**: [Main README](../../README.md)
- **CLI Package**: [@codeguide/cli](../cli/README.md)
- **Issues**: [GitHub Issues](https://github.com/CodeGuide-dev/codeguide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CodeGuide-dev/codeguide/discussions)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.