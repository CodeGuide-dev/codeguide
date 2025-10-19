# Projects Service

The Projects Service provides functionality for managing projects and their associated repositories. This service includes filtering capabilities to retrieve projects based on whether they have connected repositories.

## Features

### Project Filtering by Repository Status

The service supports filtering projects based on whether they have connected repositories using the `has_repository` parameter.

#### API Methods

##### `getAllProjects(params?: GetProjectsRequest): Promise<Project[]>`

Retrieves a list of all projects with optional filtering.

```typescript
// Get all projects with repositories
const projectsWithRepos = await codeGuide.project.getAllProjects({
  has_repository: true
})

// Get all projects without repositories
const projectsWithoutRepos = await codeGuide.project.getAllProjects({
  has_repository: false
})
```

##### `getPaginatedProjects(params: PaginatedProjectsRequest): Promise<PaginatedProjectsResponse>`

Retrieves paginated projects with advanced filtering options.

```typescript
// Combine repository filter with other filters
const paginatedProjects = await codeGuide.project.getPaginatedProjects({
  page: 1,
  page_size: 10,
  has_repository: true,
  status: 'active',
  search_query: 'web',
  sort_by_date: 'desc'
})
```

### Types

#### `GetProjectsRequest`

```typescript
interface GetProjectsRequest {
  has_repository?: boolean // Filter by repository status
}
```

#### `PaginatedProjectsRequest`

```typescript
interface PaginatedProjectsRequest {
  page?: number
  page_size?: number
  search_query?: string
  status?: string
  start_date?: string
  end_date?: string
  sort_by_date?: 'asc' | 'desc'
  has_repository?: boolean // Filter by repository status
}
```

#### `ProjectRepository`

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

#### `Project`

```typescript
interface Project {
  id: string
  title: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
  project_documents: ProjectDocument[]
  project_repositories: ProjectRepository[] // Added for repository information
  category?: Category
  codie_tool?: CodieTool
  github_url?: string
  status?: string
  tools_selected?: string[]
  ai_questionaire?: Record<string, any>
  project_outline?: Record<string, any>
}
```

## Usage Examples

### Basic Filtering

```typescript
import { CodeGuide } from '@codeguide/core'

const codeGuide = new CodeGuide({
  baseURL: 'https://api.example.com',
  apiKey: 'your-api-key'
})

// Get projects that have repositories connected
const projectsWithRepos = await codeGuide.project.getAllProjects({
  has_repository: true
})

console.log('Projects with repositories:', projectsWithRepos.length)
projectsWithRepos.forEach(project => {
  console.log(`${project.title} - ${project.project_repositories.length} repositories`)
})
```

### Advanced Filtering

```typescript
// Get paginated projects without repositories, filtered by status and search
const filteredProjects = await codeGuide.project.getPaginatedProjects({
  page: 1,
  page_size: 20,
  has_repository: false,
  status: 'in_progress',
  search_query: 'mobile'
})

console.log(`Found ${filteredProjects.pagination.total} projects`)
filteredProjects.data.forEach(project => {
  console.log(`${project.title} - No repositories connected`)
})
```

### Combining with Other Features

```typescript
// Connect a repository to a project
const connectionResult = await codeGuide.project.connectRepository(
  projectId,
  {
    repo_url: 'https://github.com/user/repo',
    branch: 'main',
    github_token: 'optional-token'
  }
)

// After connecting, verify the project appears in filtered results
const updatedProjects = await codeGuide.project.getAllProjects({
  has_repository: true
})

const isProjectInFilteredResults = updatedProjects.some(
  project => project.id === projectId
)
```

## Response Format

The API response includes project data with repository information:

```json
{
  "status": "success",
  "data": [
    {
      "id": "project-uuid",
      "title": "My Project",
      "description": "Project description",
      "project_repositories": [
        {
          "id": "repo-uuid",
          "project_id": "project-uuid",
          "repo_url": "https://github.com/user/repo",
          "branch": "main",
          "author": "user",
          "name": "repo",
          "connection_status": "connected",
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-01-01T00:00:00Z"
        }
      ],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

## Error Handling

The service includes validation for repository connections:

```typescript
try {
  await codeGuide.project.connectRepository(projectId, {
    repo_url: 'invalid-url',
    branch: 'main'
  })
} catch (error) {
  console.error('Connection failed:', error.message)
  // Example: "Repository URL must be a valid GitHub URL (e.g., https://github.com/user/repo)"
}
```

## Notes

- The `has_repository` parameter is optional
- When `has_repository=true`, only projects with at least one connected repository are returned
- When `has_repository=false`, only projects with no connected repositories are returned
- Repository information is included in the `project_repositories` field of each project
- The filtering works with both basic project listing and paginated queries