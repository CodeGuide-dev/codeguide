# @codeguide/core

The core package for CodeGuide with programmatic API access. This package provides TypeScript interfaces and services for integrating CodeGuide functionality into your applications.

## Services Overview

The `@codeguide/core` package provides a suite of services to interact with the CodeGuide API:

- **[ApiKeyEnhancedService](#apikeyenhancedservice)**: Manages API keys with enhanced features.
- **[ProjectService](#projectservice)**: Handles project creation, retrieval, and management.
- **[TaskService](#taskservice)**: Organizes and tracks development tasks within projects.
- **[CodespaceService](#codespaceservice)**: Manages AI-powered coding tasks, from generation to execution.
- **[GenerationService](#generationservice)**: Provides AI-powered code and document generation.
- **[RepositoryAnalysisService](#repositoryanalysisservice)**: Analyzes GitHub repositories for insights and documentation.
- **[ExternalTokenService](#externaltokenservice)**: Securely stores and manages external API tokens (e.g., GitHub, GitLab).
- **[SubscriptionService](#subscriptionservice)**: Manages user subscriptions and plans.
- **[UsageService](#usageservice)**: Monitors API usage, credits, and service health.
- **[CancellationFunnelService](#cancellationfunnelservice)**: Handles the subscription cancellation process.

## Features

- 🔑 **API Key Management**: Full CRUD operations for API keys.
- 📝 **Project Management**: Create and manage projects programmatically.
- 🎯 **Task Management**: Organize and track development tasks.
- 🤖 **Codespace Tasks**: Create and manage AI-powered coding tasks and workflows.
- 🎨 **Code Generation**: Generate code, documentation, and more with AI assistance.
- 🔍 **Repository Analysis**: Analyze code repositories for insights.
- 🔐 **External Token Management**: Securely store and manage external tokens (e.g., GitHub, GitLab).
- 💳 **Subscription Management**: Programmatically manage user subscriptions.
- 📊 **Usage Analytics**: Monitor API usage and credits.
- 🛡️ **TypeScript Support**: Full type safety and IntelliSense.
- ⚙️ **Multiple Authentication Methods**: Flexible auth options including database API keys, legacy keys, and JWTs.

## Installation

```bash
npm install @codeguide/core@0.0.23
```

## Quick Start

### Basic Usage

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})

// Get all API keys
const keysResponse = await codeguide.apiKeyEnhanced.getAllApiKeys()
console.log(`Found ${keysResponse.data.length} API keys`)

// Create a new API key
const newKey = await codeguide.apiKeyEnhanced.createApiKey({
  name: 'My Application',
})
console.log(`Created key: ${newKey.data.api_key}`)
```

### Codespace Task Management

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})

// Create a new codespace task for implementation
const codespaceTask = await codeguide.codespace.createCodespaceTaskV2({
  project_id: 'your_project_id',
  task_description: 'Implement a new feature for real-time notifications',
  execution_mode: 'implementation',
})
console.log(`Created codespace task: ${codespaceTask.task_id}`)

// Get task details
const taskDetails = await codeguide.codespace.getCodespaceTask(codespaceTask.task_id)
console.log(`Task status: ${taskDetails.data.status}`)
```

### Subscription Management

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})

// Get current subscription
const subscription = await codeguide.subscription.getCurrentSubscription()
console.log(
  `Current plan: ${subscription.data.product.name} (${subscription.data.subscription.status})`
)

// Get all subscriptions (including historical)
const allSubscriptions = await codeguide.subscription.getAllSubscriptions()
console.log(`Found ${allSubscriptions.data.length} total subscriptions.`)
```

### External Token Management

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})

// Store a GitHub token
const storedToken = await codeguide.externalTokens.storeExternalToken({
  platform: 'github',
  token: 'ghp_your_github_token',
  token_name: 'My Personal GitHub Token',
  token_type: 'personal_access_token',
})
console.log(`Stored token with ID: ${storedToken.id}`)

// List all stored GitHub tokens
const githubTokens = await codeguide.externalTokens.listTokens({ platform: 'github' })
console.log(`Found ${githubTokens.tokens.length} GitHub tokens.`)
```

## Authentication

The CodeGuide client supports multiple authentication methods with automatic priority handling:

### 1. Database API Key (Highest Priority)

Recommended method. The key must be prefixed with `sk_`.

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})
```

### 2. Legacy API Key + User ID

For backward compatibility.

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  apiKey: 'your_api_key',
  userId: 'your_user_id',
})
```

### 3. Clerk JWT Token

For applications using Clerk for authentication.

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  jwtToken: 'your_jwt_token',
})
```

### Automatic Fallback

The client automatically falls back through authentication methods based on the priority order (1 > 2 > 3).

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_key', // Will try this first
  apiKey: 'legacy_key', // Fallback if database key is invalid or missing
  userId: 'user_id', // Required for legacy auth
  jwtToken: 'jwt_token', // Final fallback
})
```

## API Reference

### ApiKeyEnhancedService

- `getAllApiKeys(): Promise<ApiKeyListResponse>`
- `createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse>`
- `revokeApiKey(apiKeyId: string): Promise<RevokeApiKeyResponse>`
- `checkApiKeyPermission(): Promise<ApiKeyPermissionResponse>`
- `getApiKeyById(apiKeyId: string): Promise<ApiKeyResponse>`

### ProjectService

- `getAllProjects(params?: GetProjectsRequest): Promise<Project[]>`
- `getPaginatedProjects(params: PaginatedProjectsRequest): Promise<PaginatedProjectsResponse>`
- `getProjectById(projectId: string): Promise<Project>`
- `createProject(request: CreateProjectRequest): Promise<Project>`
- `updateProject(projectId: string, request: UpdateProjectRequest): Promise<Project>`
- `deleteProject(projectId: string): Promise<{ status: string; message: string }>`
- `connectRepository(projectId: string, request: ConnectRepositoryRequest): Promise<ConnectRepositoryResponse>`

### TaskService

- `getAllTaskGroups(): Promise<TaskGroup[]>`
- `getPaginatedTaskGroups(params: PaginatedTaskGroupsRequest): Promise<PaginatedTaskGroupsResponse>`
- `createTaskGroup(request: CreateTaskGroupRequest): Promise<TaskGroup>`
- `getProjectTaskById(taskId: string): Promise<ProjectTask>`
- `createProjectTask(request: CreateProjectTaskRequest): Promise<ProjectTask>`
- `updateProjectTask(taskId: string, request: UpdateProjectTaskRequest): Promise<ProjectTask>`

### CodespaceService

- `createCodespaceTaskV2(request: CreateCodespaceTaskRequestV2): Promise<CreateCodespaceTaskResponseV2>`
- `createBackgroundCodespaceTask(request: CreateBackgroundCodespaceTaskRequest): Promise<CreateBackgroundCodespaceTaskResponse>`
- `getCodespaceTask(codespaceTaskId: string): Promise<GetCodespaceTaskResponse>`
- `getCodespaceTasksByProject(params: GetCodespaceTasksByProjectRequest): Promise<GetCodespaceTasksByProjectResponse>`
- `getCodespaceTaskDetailed(codespaceTaskId: string): Promise<CodespaceTaskDetailedResponse>`

### GenerationService

- `refinePrompt(request: RefinePromptRequest): Promise<RefinePromptResponse>`
- `generateTitle(request: GenerateTitleRequest): Promise<GenerateTitleResponse>`
- `generatePRD(request: GeneratePRDRequest): Promise<GeneratePRDResponse>`
- `generateDocument(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse>`
- `startBackgroundGeneration(request: BackgroundGenerationRequest): Promise<BackgroundGenerationResponse>`
- `getBackgroundGenerationStatus(jobId: string): Promise<BackgroundGenerationStatusResponse>`

### RepositoryAnalysisService

- `analyzeRepository(request: AnalyzeRepositoryRequest): Promise<AnalyzeRepositoryResponse>`
- `getAnalysisStatus(taskId: string): Promise<RepositoryAnalysisStatusResponse>`
- `getAnalysisResult(taskId: string): Promise<RepositoryAnalysisResultResponse>`
- `listRepositories(skip?: number, limit?: number): Promise<RepositoryListResponse>`

### ExternalTokenService

- `storeExternalToken(request: StoreExternalTokenRequest): Promise<StoreExternalTokenResponse>`
- `listTokens(query?: ListTokensQuery): Promise<ListTokensResponse>`
- `getToken(tokenId: string): Promise<GetTokenResponse>`
- `validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse>`
- `findBestMatch(request: FindBestMatchRequest): Promise<FindBestMatchResponse>`
- `revokeToken(tokenId: string): Promise<RevokeTokenResponse>`

### SubscriptionService

- `getCurrentSubscription(): Promise<CurrentSubscriptionResponse>`
- `getAllSubscriptions(): Promise<UserSubscriptionsResponse>`
- `cancelSubscription(subscriptionId: string, request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse>`
- `getSubscriptionById(subscriptionId: string): Promise<any>`

### UsageService

- `getCreditBalance(): Promise<CreditBalanceResponse>`
- `getUsageSummary(params?: UsageSummaryRequest): Promise<UsageSummaryResponse>`
- `checkCredits(params: CreditCheckRequest): Promise<CreditCheckResponse>`
- `getAuthorization(): Promise<AuthorizationResponse>`
- `healthCheck(): Promise<boolean>`

### CancellationFunnelService

- `initiateCancellation(request: CancellationFunnelInitiateRequest): Promise<CancellationFunnelInitiateResponse>`
- `logSurveyResponse(request: CancellationFunnelSurveyRequest): Promise<CancellationFunnelSurveyResponse>`
- `getCancellationFunnelStatus(subscriptionId: string): Promise<any>`

## Types

The package exports all necessary types for requests and responses.

### Core Types

```typescript
interface APIServiceConfig {
  baseUrl: string
  databaseApiKey?: string // Highest priority (sk_...)
  apiKey?: string // Legacy API key
  userId?: string // Required for legacy auth
  jwtToken?: string // Clerk JWT token
  timeout?: number // Default: 3600000 (1 hour)
}

interface CodeGuideOptions {
  language?: string
  context?: string
  verbose?: boolean
}
```

### Key Service Types

```typescript
// projects/project-types.ts
interface Project {
  id: string
  title: string
  description: string
  project_repositories: ProjectRepository[]
  // ... and more
}

// codespace/codespace-types.ts
interface CreateCodespaceTaskRequestV2 {
  project_id: string
  task_description: string
  execution_mode?: 'implementation' | 'docs-only' | 'direct'
  // ... and more
}

// external-tokens/external-tokens-types.ts
type Platform = 'github' | 'gitlab' | 'bitbucket'
interface StoreExternalTokenRequest {
  platform: Platform
  token: string
  token_name: string
  token_type: TokenType
  // ... and more
}

// types.ts
interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'trialing' | ...
  // ... and more
}
```

For a full list of types, please refer to the source files in `services/**/**-types.ts` and `types.ts`.

## Error Handling

The client provides detailed error information for failed API calls. It is recommended to wrap API calls in a `try...catch` block.

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

You can configure the request timeout (in milliseconds). The default is 1 hour.

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key',
  timeout: 1800000, // 30 minutes
})
```

### Verbose Logging

Enable verbose logging to see detailed request and response information in the console.

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

MIT License - see the LICENSE file for details.
