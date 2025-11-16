# CodeGuide Client

The `CodeGuide` class is the main entry point for interacting with the CodeGuide API. It provides access to all available services and handles authentication automatically.

## Overview

The `CodeGuide` class initializes and manages all service instances, providing a unified interface to interact with the CodeGuide API.

## Installation

```bash
npm install @codeguide/core
```

## Basic Initialization

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})
```

## Constructor

### Signature

```typescript
constructor(config: APIServiceConfig, options?: CodeGuideOptions)
```

### Parameters

#### config: APIServiceConfig

The API service configuration object:

```typescript
interface APIServiceConfig {
  baseUrl: string                    // Required: API base URL
  databaseApiKey?: string             // Recommended: Database API key (format: sk_...)
  apiKey?: string                     // Legacy: Legacy API key
  userId?: string                     // Legacy: User ID (required with apiKey)
  jwtToken?: string                   // Alternative: Clerk JWT token
  timeout?: number                    // Optional: Request timeout in milliseconds (default: 3600000)
}
```

#### options: CodeGuideOptions (Optional)

Additional options for the CodeGuide client:

```typescript
interface CodeGuideOptions {
  language?: string    // Default language for requests
  context?: string     // Default context for requests
  verbose?: boolean    // Enable verbose logging
}
```

### Example

```typescript
const codeguide = new CodeGuide(
  {
    baseUrl: 'https://api.codeguide.ai',
    databaseApiKey: 'sk_your_database_api_key',
    timeout: 30000,
  },
  {
    language: 'typescript',
    verbose: true,
  }
)
```

## Available Services

The CodeGuide client provides access to the following services:

| Service | Property | Description |
|---------|----------|-------------|
| **Projects** | `codeguide.projects` | Project management and repository connections |
| **Codespace** | `codeguide.codespace` | AI-powered coding tasks and workflows |
| **Security Keys** | `codeguide.securityKeys` | Provider API keys and GitHub token management |
| **Usage** | `codeguide.usage` | Usage tracking and authorization |
| **Generation** | `codeguide.generation` | AI-powered code and document generation |
| **Repository Analysis** | `codeguide.repositoryAnalysis` | Repository analysis and insights |
| **Tasks** | `codeguide.tasks` | Task group and project task management |
| **API Key Enhanced** | `codeguide.apiKeyEnhanced` | Enhanced API key management |
| **Subscription** | `codeguide.subscription` | Subscription management |
| **Cancellation Funnel** | `codeguide.cancellationFunnel` | Subscription cancellation process |
| **External Tokens** | `codeguide.externalTokens` | External token management (GitHub, GitLab, etc.) |
| **Users** | `codeguide.users` | User management |
| **Starter Kits** | `codeguide.starterKits` | Retrieve starter kits for bootstrapping projects |

## Helper Methods

### getGuidance()

Convenience method for backward compatibility. Generates guidance from a prompt.

#### Signature

```typescript
async getGuidance(prompt: string): Promise<any>
```

#### Parameters

- `prompt` (string, required): The user prompt

#### Returns

```typescript
{
  id: string
  response: string
  timestamp: string
  language?: string
}
```

#### Example

```typescript
const guidance = await codeguide.getGuidance(
  'How do I implement user authentication?'
)

console.log(guidance.response)
console.log(guidance.timestamp)
```

### isHealthy()

Check if the API service is healthy and accessible.

#### Signature

```typescript
async isHealthy(): Promise<boolean>
```

#### Returns

- `boolean`: `true` if the service is healthy, `false` otherwise

#### Example

```typescript
const healthy = await codeguide.isHealthy()

if (healthy) {
  console.log('API is healthy')
} else {
  console.log('API is not responding')
}
```

### createTaskGroupWithCodespace()

Helper method to create a task group with codespace task integration.

#### Signature

```typescript
async createTaskGroupWithCodespace(request: {
  name: string
  description?: string
  project_id: string
  include_codespace_task?: boolean
  project_description?: string
}): Promise<any>
```

#### Parameters

- `request.name` (string, required): Task group name
- `request.description` (string, optional): Task group description
- `request.project_id` (string, required): Project ID
- `request.include_codespace_task` (boolean, optional): Include codespace task
- `request.project_description` (string, optional): Project description

#### Example

```typescript
const taskGroup = await codeguide.createTaskGroupWithCodespace({
  name: 'Authentication Implementation',
  description: 'Implement user authentication system',
  project_id: 'proj_123456',
  include_codespace_task: true
})
```

### setOptions()

Update the CodeGuide client options.

#### Signature

```typescript
setOptions(options: Partial<CodeGuideOptions>): void
```

#### Parameters

- `options` (Partial<CodeGuideOptions>): Options to update

#### Example

```typescript
codeguide.setOptions({
  language: 'python',
  verbose: false,
})
```

## Configuration

### Base URL

The `baseUrl` should point to your CodeGuide API endpoint:

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai', // Production
  // baseUrl: 'https://api.codeguide.dev', // Development
  databaseApiKey: 'sk_your_key',
})
```

### Timeout Configuration

Configure the request timeout (in milliseconds). The default is 1 hour (3600000ms).

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key',
  timeout: 1800000, // 30 minutes
})
```

### Verbose Logging

Enable verbose logging to see detailed request and response information:

```typescript
const codeguide = new CodeGuide(
  {
    baseUrl: 'https://api.codeguide.ai',
    databaseApiKey: 'sk_your_key',
  },
  {
    verbose: true, // Enable detailed logging
  }
)
```

## Complete Example

```typescript
import { CodeGuide } from '@codeguide/core'

// Initialize the client
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
  timeout: 30000,
}, {
  language: 'typescript',
  verbose: process.env.NODE_ENV === 'development',
})

// Check health
const isHealthy = await codeguide.isHealthy()
if (!isHealthy) {
  throw new Error('API is not healthy')
}

// Get all projects
const projects = await codeguide.projects.getAllProjects()
console.log(`Found ${projects.length} projects`)

// Create a new project
const newProject = await codeguide.projects.createProject({
  title: 'My New Project',
  description: 'Project description',
})

// Create a codespace task
const task = await codeguide.codespace.createCodespaceTaskV2({
  project_id: newProject.id,
  task_description: 'Implement user authentication',
  execution_mode: 'implementation',
})

console.log(`Created task: ${task.task_id}`)
```

## Error Handling

All methods throw errors for various failure conditions. It's recommended to wrap API calls in try-catch blocks:

```typescript
try {
  const projects = await codeguide.projects.getAllProjects()
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

## Type Exports

The package exports all necessary types:

```typescript
import type {
  CodeGuide,
  APIServiceConfig,
  CodeGuideOptions,
} from '@codeguide/core'
```

## Best Practices

1. **Use Environment Variables**: Store API keys in environment variables
2. **Handle Errors**: Always wrap API calls in try-catch blocks
3. **Check Health**: Use `isHealthy()` before making critical requests
4. **Set Appropriate Timeouts**: Adjust timeout based on expected operation duration
5. **Enable Verbose Logging**: Use verbose mode during development for debugging

## Related Documentation

- [Authentication](./authentication.md) - Authentication methods and configuration
- [Projects Service](./projects-service.md) - Project management
- [Codespace Service](./codespace-service.md) - Codespace tasks
- [Security Keys Service](./security-keys-service.md) - Security key management

