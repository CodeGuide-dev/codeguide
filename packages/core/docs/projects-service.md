# Projects Service

The Projects Service provides methods for managing projects, including creation, retrieval, updates, deletion, and repository connections.

## Overview

The Projects Service allows you to:
- Create and manage projects
- Retrieve projects with filtering and pagination
- Connect GitHub repositories to projects
- Manage project documents
- Update and delete projects

## Setup

### Installation

```bash
npm install @codeguide/core
```

### Basic Initialization

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key',
})

// Access the projects service
const projects = codeguide.projects
```

## Methods Overview

| Method | Description | Endpoint |
|--------|-------------|----------|
| `getAllProjects()` | Get all projects with optional filtering | `GET /projects` |
| `getPaginatedProjects()` | Get paginated projects with advanced filtering | `GET /projects/paginated` |
| `getProjectById()` | Get a specific project by ID | `GET /projects/{id}` |
| `createProject()` | Create a new project | `POST /projects` |
| `updateProject()` | Update an existing project | `PUT /projects/{id}` |
| `deleteProject()` | Delete a project | `DELETE /projects/{id}` |
| `getProjectDocuments()` | Get documents for a project | `GET /projects/{id}/documents` |
| `connectRepository()` | Connect a GitHub repository to a project | `POST /projects/{id}/repository` |

## Detailed Method Documentation

### 1. getAllProjects()

Retrieves all projects for the authenticated user with optional filtering.

#### Signature

```typescript
async getAllProjects(params?: GetProjectsRequest): Promise<Project[]>
```

#### Parameters

```typescript
interface GetProjectsRequest {
  has_repository?: boolean  // Filter by repository connection status
}
```

#### Returns

- `Promise<Project[]>`: Array of project objects

#### Example

```typescript
// Get all projects
const allProjects = await codeguide.projects.getAllProjects()

// Get only projects with repositories
const projectsWithRepos = await codeguide.projects.getAllProjects({
  has_repository: true,
})

console.log(`Found ${projectsWithRepos.length} projects with repositories`)
```

### 2. getPaginatedProjects()

Retrieves projects with pagination and advanced filtering options.

#### Signature

```typescript
async getPaginatedProjects(params: PaginatedProjectsRequest): Promise<PaginatedProjectsResponse>
```

#### Parameters

```typescript
interface PaginatedProjectsRequest {
  page?: number                    // Page number (default: 1)
  page_size?: number               // Items per page
  search_query?: string            // Search query string
  status?: string                  // Filter by status
  start_date?: string              // Filter by start date (ISO format)
  end_date?: string                // Filter by end date (ISO format)
  sort_by_date?: 'asc' | 'desc'   // Sort order by date
  has_repository?: boolean         // Filter by repository connection
}
```

#### Returns

```typescript
interface PaginatedProjectsResponse {
  status: string
  data: Project[]
  count: number              // Total number of items
  page: number               // Current page
  page_size: number          // Items per page
  total_pages: number        // Total number of pages
}
```

#### Example

```typescript
// Get first page of projects
const firstPage = await codeguide.projects.getPaginatedProjects({
  page: 1,
  page_size: 10,
  sort_by_date: 'desc',
})

console.log(`Page ${firstPage.page} of ${firstPage.total_pages}`)
console.log(`Showing ${firstPage.data.length} of ${firstPage.count} projects`)

// Search projects
const searchResults = await codeguide.projects.getPaginatedProjects({
  search_query: 'authentication',
  page_size: 20,
})

// Filter by date range
const recentProjects = await codeguide.projects.getPaginatedProjects({
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  sort_by_date: 'desc',
})
```

### 3. getProjectById()

Retrieves a specific project by its ID.

#### Signature

```typescript
async getProjectById(projectId: string): Promise<Project>
```

#### Parameters

- `projectId` (string, required): The project ID

#### Returns

- `Promise<Project>`: Project object with full details

#### Example

```typescript
const project = await codeguide.projects.getProjectById('proj_123456')

console.log(`Project: ${project.title}`)
console.log(`Description: ${project.description}`)
console.log(`Repositories: ${project.project_repositories.length}`)
console.log(`Documents: ${project.project_documents.length}`)
```

### 4. createProject()

Creates a new project.

#### Signature

```typescript
async createProject(request: CreateProjectRequest): Promise<Project>
```

#### Parameters

```typescript
interface CreateProjectRequest {
  title: string                      // Required: Project title
  description: string                 // Required: Project description
  category_id?: string               // Optional: Category ID
  codie_tool_id?: string             // Optional: Codie tool ID
  tools_selected?: string[]           // Optional: Selected tools
  ai_questionaire?: Record<string, any>  // Optional: AI questionnaire data
  project_outline?: Record<string, any>  // Optional: Project outline
  github_url?: string                // Optional: GitHub URL
}
```

#### Returns

- `Promise<Project>`: Created project object

#### Example

```typescript
// Basic project creation
const project = await codeguide.projects.createProject({
  title: 'My New Project',
  description: 'A project for building a web application',
})

console.log(`Created project: ${project.id}`)

// Project with additional metadata
const detailedProject = await codeguide.projects.createProject({
  title: 'E-commerce Platform',
  description: 'Full-featured e-commerce solution',
  category_id: 'cat_123',
  tools_selected: ['react', 'nodejs', 'postgresql'],
  github_url: 'https://github.com/user/ecommerce',
  ai_questionaire: {
    target_audience: 'Small businesses',
    tech_stack: 'React, Node.js',
  },
})
```

### 5. updateProject()

Updates an existing project.

#### Signature

```typescript
async updateProject(projectId: string, request: UpdateProjectRequest): Promise<Project>
```

#### Parameters

- `projectId` (string, required): The project ID to update
- `request` (UpdateProjectRequest): Update request object

```typescript
interface UpdateProjectRequest {
  title?: string                      // Optional: New title
  description?: string                 // Optional: New description
  category_id?: string                 // Optional: New category ID
  codie_tool_id?: string              // Optional: New Codie tool ID
  tools_selected?: string[]            // Optional: Updated tools
  ai_questionaire?: Record<string, any>   // Optional: Updated questionnaire
  project_outline?: Record<string, any>   // Optional: Updated outline
  github_url?: string                  // Optional: Updated GitHub URL
  status?: string                      // Optional: Project status
}
```

#### Returns

- `Promise<Project>`: Updated project object

#### Example

```typescript
// Update project title and description
const updated = await codeguide.projects.updateProject('proj_123456', {
  title: 'Updated Project Title',
  description: 'Updated description',
})

// Update project status
const statusUpdated = await codeguide.projects.updateProject('proj_123456', {
  status: 'completed',
})

// Update multiple fields
const multiUpdate = await codeguide.projects.updateProject('proj_123456', {
  title: 'New Title',
  tools_selected: ['react', 'typescript'],
  github_url: 'https://github.com/user/new-repo',
})
```

### 6. deleteProject()

Deletes a project.

#### Signature

```typescript
async deleteProject(projectId: string): Promise<{ status: string; message: string }>
```

#### Parameters

- `projectId` (string, required): The project ID to delete

#### Returns

```typescript
{
  status: string    // Status of the deletion
  message: string   // Deletion message
}
```

#### Example

```typescript
const result = await codeguide.projects.deleteProject('proj_123456')

console.log(result.status)   // "success"
console.log(result.message)  // "Project deleted successfully"
```

### 7. getProjectDocuments()

Retrieves documents associated with a project.

#### Signature

```typescript
async getProjectDocuments(
  projectId: string,
  params?: GetProjectDocumentsRequest
): Promise<GetProjectDocumentsResponse>
```

#### Parameters

- `projectId` (string, required): The project ID
- `params` (GetProjectDocumentsRequest, optional): Query parameters

```typescript
interface GetProjectDocumentsRequest {
  current_version_only?: boolean  // Only return current versions
}
```

#### Returns

```typescript
interface GetProjectDocumentsResponse {
  status: string
  data: ProjectDocument[]
}

interface ProjectDocument {
  id: string
  created_at: string
  updated_at: string | null
  project_id: string
  user_id: string
  title: string
  document_type: string
  description: string | null
  content: string
  custom_document_type: string
  last_action: string
  is_current_version: boolean
  status: string
}
```

#### Example

```typescript
// Get all documents
const allDocs = await codeguide.projects.getProjectDocuments('proj_123456')

// Get only current versions
const currentDocs = await codeguide.projects.getProjectDocuments('proj_123456', {
  current_version_only: true,
})

console.log(`Found ${currentDocs.data.length} current documents`)
currentDocs.data.forEach(doc => {
  console.log(`- ${doc.title} (${doc.document_type})`)
})
```

### 8. connectRepository()

Connects a GitHub repository to a project.

#### Signature

```typescript
async connectRepository(
  projectId: string,
  request: ConnectRepositoryRequest
): Promise<ConnectRepositoryResponse>
```

#### Parameters

- `projectId` (string, required): The project ID
- `request` (ConnectRepositoryRequest): Repository connection request

```typescript
interface ConnectRepositoryRequest {
  repo_url: string        // Required: GitHub repository URL
  branch: string          // Required: Branch name
  github_token?: string   // Optional: GitHub personal access token
}
```

#### Returns

```typescript
interface ConnectRepositoryResponse {
  status: string
  data: {
    id: string
    project_id: string
    repo_url: string
    branch: string
    connection_status: 'pending' | 'connected' | 'failed'
    created_at: string
    updated_at: string
  }
}
```

#### Validation Rules

The method validates:
- Repository URL must be a valid GitHub URL (format: `https://github.com/user/repo`)
- Branch name must contain only alphanumeric characters, dots, underscores, and hyphens
- GitHub token (if provided) must be a valid personal access token (prefixes: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`)

#### Example

```typescript
// Connect repository without token (uses stored token if available)
const connection = await codeguide.projects.connectRepository('proj_123456', {
  repo_url: 'https://github.com/user/my-repo',
  branch: 'main',
})

console.log(`Connection status: ${connection.data.connection_status}`)

// Connect repository with explicit token
const connectionWithToken = await codeguide.projects.connectRepository('proj_123456', {
  repo_url: 'https://github.com/user/my-repo',
  branch: 'develop',
  github_token: 'ghp_your_github_token',
})

// Check connection status
if (connectionWithToken.data.connection_status === 'connected') {
  console.log('Repository connected successfully')
} else if (connectionWithToken.data.connection_status === 'pending') {
  console.log('Repository connection pending')
} else {
  console.log('Repository connection failed')
}
```

## Type Definitions

### Project

```typescript
interface Project {
  id: string
  title: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
  project_documents: ProjectDocument[]
  project_repositories: ProjectRepository[]
  category?: Category
  codie_tool?: CodieTool
  github_url?: string
  status?: string
  tools_selected?: string[]
  ai_questionaire?: Record<string, any>
  project_outline?: Record<string, any>
}
```

### ProjectRepository

```typescript
interface ProjectRepository {
  id: string
  project_id: string
  repo_url: string
  branch: string
  author: string
  name: string
  connection_status: 'pending' | 'connected' | 'failed'
  created_at: string
  updated_at: string
}
```

### Category

```typescript
interface Category {
  id: string
  name: string
  description?: string
}
```

### CodieTool

```typescript
interface CodieTool {
  id: string
  name: string
  description?: string
  category?: string
}
```

## Error Handling

### Validation Errors

```typescript
try {
  await codeguide.projects.connectRepository('proj_123', {
    repo_url: 'invalid-url',
    branch: 'main',
  })
} catch (error) {
  console.error(error.message) // "Repository URL must be a valid GitHub URL"
}
```

### API Errors

```typescript
try {
  const project = await codeguide.projects.getProjectById('invalid_id')
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Project not found')
  } else if (error.message.includes('401')) {
    console.error('Authentication failed')
  } else {
    console.error('API error:', error.message)
  }
}
```

## Complete Examples

### Example 1: Project Lifecycle

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})

async function projectLifecycle() {
  try {
    // 1. Create a new project
    const project = await codeguide.projects.createProject({
      title: 'My Web Application',
      description: 'A modern web application built with React and Node.js',
    })

    console.log(`Created project: ${project.id}`)

    // 2. Connect a repository
    const repo = await codeguide.projects.connectRepository(project.id, {
      repo_url: 'https://github.com/user/my-web-app',
      branch: 'main',
    })

    console.log(`Repository connected: ${repo.data.connection_status}`)

    // 3. Update project with additional information
    const updated = await codeguide.projects.updateProject(project.id, {
      tools_selected: ['react', 'nodejs', 'typescript'],
      status: 'in_progress',
    })

    console.log(`Project updated: ${updated.title}`)

    // 4. Get project documents
    const documents = await codeguide.projects.getProjectDocuments(project.id, {
      current_version_only: true,
    })

    console.log(`Found ${documents.data.length} documents`)

    // 5. Get full project details
    const fullProject = await codeguide.projects.getProjectById(project.id)
    console.log(`Project has ${fullProject.project_repositories.length} repositories`)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

projectLifecycle()
```

### Example 2: Project Search and Filtering

```typescript
async function searchProjects() {
  // Search for projects
  const searchResults = await codeguide.projects.getPaginatedProjects({
    search_query: 'authentication',
    page: 1,
    page_size: 10,
    sort_by_date: 'desc',
  })

  console.log(`Found ${searchResults.count} projects matching "authentication"`)

  // Get projects with repositories
  const projectsWithRepos = await codeguide.projects.getPaginatedProjects({
    has_repository: true,
    page_size: 20,
  })

  console.log(`Found ${projectsWithRepos.data.length} projects with repositories`)

  // Filter by date range
  const recentProjects = await codeguide.projects.getPaginatedProjects({
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    sort_by_date: 'desc',
    page_size: 50,
  })

  console.log(`Found ${recentProjects.count} projects in 2024`)
}
```

### Example 3: Batch Operations

```typescript
async function batchOperations() {
  // Get all projects
  const allProjects = await codeguide.projects.getAllProjects()

  // Process each project
  for (const project of allProjects) {
    console.log(`Processing: ${project.title}`)

    // Get documents for each project
    const docs = await codeguide.projects.getProjectDocuments(project.id, {
      current_version_only: true,
    })

    console.log(`  - ${docs.data.length} documents`)

    // Check repository status
    if (project.project_repositories.length > 0) {
      const repo = project.project_repositories[0]
      console.log(`  - Repository: ${repo.connection_status}`)
    }
  }
}
```

## Best Practices

1. **Use Pagination**: For large datasets, use `getPaginatedProjects()` instead of `getAllProjects()`
2. **Validate Input**: Validate repository URLs and branch names before calling `connectRepository()`
3. **Handle Errors**: Always wrap API calls in try-catch blocks
4. **Cache Results**: Cache project data when possible to reduce API calls
5. **Use Filters**: Use query parameters to filter results server-side rather than client-side

## Related Documentation

- [CodeGuide Client](./codeguide-client.md) - Client initialization
- [Authentication](./authentication.md) - Authentication methods
- [Codespace Service](./codespace-service.md) - Creating codespace tasks for projects

