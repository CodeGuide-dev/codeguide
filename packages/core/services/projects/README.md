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
  name: string
  repo_url: string
  branch: string
  project_id: string
  user_id: string
  files_processed: number
  total_characters: number
  total_lines: number
  total_files_found: number
  total_directories: number
  author: string
  estimated_tokens: number
  estimated_size_bytes: number
  created_at: string
}
```

#### `Project`

```typescript
interface Project {
  id: string
  title: string
  description: string
  status: string
  category_id: string
  starter_kit_id?: string
  ai_questionaire?: {
    experience_level?: string
    timeline?: string
    team_size?: number
  }
  tools_selected?: string[]
  project_outline?: {
    features?: string[]
    architecture?: string
  }
  codie_tool_id?: string
  existing_project_repo_url?: string | null
  created_at: string
  updated_at: string
  user_id: string
  project_documents: ProjectDocument[]
  category?: Category
  starter_kit?: StarterKitReference
  codie_tool?: CodieTool
  project_repositories: ProjectRepository[]
}
```

### Project Creation

#### `CreateProjectRequest`

```typescript
interface CreateProjectRequest {
  title?: string // Optional - will be auto-generated if not provided
  description: string
  status?: 'prompt' | 'draft' | 'in_progress' | 'completed'
  category_id?: string
  starter_kit_id?: string
  ai_questionaire?: {
    experience_level?: string
    timeline?: string
    team_size?: number
  }
  tools_selected?: string[]
  project_outline?: {
    features?: string[]
    architecture?: string
  }
  codie_tool_id?: string
  existing_project_repo_url?: string
}
```

#### Automatic Title Generation

The API now supports automatic title generation when creating projects without a title. The system generates titles using this priority order:

1. **Project description** (highest priority)
2. **AI questionnaire** responses
3. **Project outline** information
4. **"Untitled Project"** (fallback when no context is available)

#### Usage Examples

```typescript
// Create project without title - API will auto-generate
const newProject = await codeGuide.project.createProject({
  description: "A todo app built with React and Node.js",
  tools_selected: ["React", "Node.js", "MongoDB"]
})

// The API will generate a title like "React Node.js Todo Application"
console.log(newProject.title) // Auto-generated title
```

#### Generated Title Examples

- Input: "A todo app built with React and Node.js" → "React Node.js Todo Application"
- Input: "Mobile banking app with biometric authentication" → "Mobile Banking App Biometric Authentication"
- Empty description with questionnaire → "Untitled Project" (fallback)

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

The API response includes comprehensive project data with repository information, categories, starter kits, and codie tools:

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "E-commerce Platform",
    "description": "A full-stack e-commerce platform with React and Node.js",
    "status": "in_progress",
    "category_id": "cat_123",
    "starter_kit_id": "starter_456",
    "ai_questionaire": {
      "experience_level": "intermediate",
      "timeline": "3 months",
      "team_size": 2
    },
    "tools_selected": ["react", "nodejs", "postgresql", "docker"],
    "project_outline": {
      "features": ["user authentication", "product catalog", "shopping cart", "payment integration"],
      "architecture": "microservices"
    },
    "codie_tool_id": "tool_789",
    "existing_project_repo_url": null,
    "created_at": "2023-10-01T10:00:00Z",
    "updated_at": "2023-10-15T14:30:00Z",
    "user_id": "user_abc123",
    "project_documents": [
      {
        "id": "doc_111",
        "project_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "user_abc123",
        "title": "API Documentation",
        "document_type": "api",
        "description": "REST API endpoints documentation",
        "content": "## API Documentation\n\n### Authentication\n...",
        "custom_document_type": "api_docs",
        "last_action": "document_creation",
        "is_current_version": true,
        "status": "completed",
        "created_at": "2023-10-05T09:00:00Z",
        "updated_at": "2023-10-05T09:00:00Z"
      }
    ],
    "category": {
      "id": "cat_123",
      "name": "Web Development",
      "description": "Full-stack web application projects"
    },
    "starter_kit": {
      "id": "starter_456",
      "name": "React E-commerce Starter",
      "description": "A complete e-commerce starter kit with React, Node.js, and PostgreSQL"
    },
    "codie_tool": {
      "id": "tool_789",
      "name": "Code Generator Pro",
      "description": "AI-powered code generation tool",
      "type": "code_generator",
      "api_endpoint": "https://api.example.com/generate",
      "created_at": "2023-09-01T00:00:00Z",
      "updated_at": "2023-09-15T12:00:00Z"
    },
    "project_repositories": [
      {
        "id": "repo_333",
        "name": "ecommerce-platform",
        "repo_url": "https://github.com/user/ecommerce-platform",
        "branch": "main",
        "project_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "user_abc123",
        "files_processed": 150,
        "total_characters": 125000,
        "total_lines": 4500,
        "total_files_found": 180,
        "total_directories": 25,
        "author": "John Doe",
        "estimated_tokens": 150000,
        "estimated_size_bytes": 512000,
        "created_at": "2023-10-02T11:00:00Z"
      }
    ]
  }
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