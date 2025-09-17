# CodeGuide API Services

This directory contains modular services for interacting with different CodeGuide API endpoints.

## Available Services

### 1. GenerationService (`/generate`)

Handles AI-powered content generation:

- `refinePrompt()` - Refine user prompts
- `generateTitle()` - Generate project titles
- `generateQuestionnaire()` - Generate questionnaires
- `generatePRD()` - Generate Project Requirements Documents
- `generateCategory()` - Suggest project categories
- `generateOutline()` - Generate document outlines
- `generateDocument()` - Generate custom documents
- `generateMultipleDocuments()` - Generate multiple documents in parallel
- `startBackgroundGeneration()` - Start background generation jobs
- `getBackgroundGenerationStatus()` - Check background job status

### 2. ProjectService (`/projects`)

Manages projects:

- `getAllProjects()` - Get all user projects
- `getPaginatedProjects()` - Get paginated projects with filtering
- `getProjectById()` - Get specific project
- `createProject()` - Create new project
- `updateProject()` - Update existing project
- `deleteProject()` - Delete project

### 3. UsageService (`/usage`)

Handles usage tracking and credits:

- `trackUsage()` - Track API usage
- `getCreditBalance()` - Get current credit balance
- `checkCredits()` - Check if sufficient credits available
- `getUsageSummary()` - Get detailed usage summary
- `getAuthorization()` - Get user authorization status
- `getFreeUserStatus()` - Check free user status
- `calculateUsageCost()` - Calculate usage costs
- `trackCodespaceUsage()` - Track codespace usage
- `getCodespaceTaskUsage()` - Get codespace usage details
- `healthCheck()` - Check API health

### 4. RepositoryAnalysisService (`/repository-analysis`)

Analyzes GitHub repositories:

- `analyzeRepository()` - Start repository analysis
- `getAnalysisStatus()` - Check analysis status
- `getAnalysisResult()` - Get analysis results
- `listRepositories()` - List analyzed repositories
- `getRepositoryDetails()` - Get repository details
- `deleteRepository()` - Delete repository analysis

### 5. TaskService (`/task-groups`, `/project-tasks`)

Manages task groups and project tasks:

- **Task Groups**: CRUD operations for task groups
- **Project Tasks**: CRUD operations for project tasks
- **Pagination**: Support for paginated results
- **Filtering**: Filter by status, project, parent task, etc.

### 6. BaseService

Base class providing common functionality:

- HTTP client setup with proper headers
- Error handling with standardized responses
- Authentication handling (API Key + User ID)
- Request/response interceptors
- Common HTTP methods (GET, POST, PUT, DELETE)

## Usage Example

```typescript
import { CodeGuide, APIServiceConfig } from '@codeguide/core';

const config: APIServiceConfig = {
  baseUrl: 'https://api.codeguide.app',
  apiKey: 'your-api-key',
  userId: 'your-user-id',
};

const codeguide = new CodeGuide(config);

// Use different services
const projects = await codeguide.projects.getAllProjects();
const creditBalance = await codeguide.usage.getCreditBalance();
const refinedPrompt = await codeguide.generation.refinePrompt({
  user_prompt: 'How do I create a React component?',
});
```

## Configuration

All services accept the same configuration:

- `baseUrl`: API base URL (defaults to https://api.codeguide.app)
- `apiKey`: API key for authentication
- `userId`: User ID for authentication
- `timeout`: Request timeout (default: 30000ms)

## Authentication

Services use the CodeGuide API authentication scheme:

- Primary: `X-API-Key` + `X-User-ID` headers
- Fallback: `Authorization: Bearer <token>`
