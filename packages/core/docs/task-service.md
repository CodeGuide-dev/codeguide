# Task Service Documentation

This guide covers how to use the Task Service methods through the CodeGuide service for managing project tasks, task groups, and automated task generation.

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

// Access the task service
const tasks = codeguide.tasks
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

The Task Service provides the following methods:

| Method                            | Description                            | Endpoint                               |
| --------------------------------- | -------------------------------------- | -------------------------------------- |
| `getAllTaskGroups()`              | Get all task groups                    | `GET /task-groups`                     |
| `getPaginatedTaskGroups()`        | Get paginated task groups              | `GET /task-groups/paginated`           |
| `getTaskGroupById()`              | Get task group by ID                   | `GET /task-groups/{id}`                |
| `createTaskGroup()`               | Create a new task group                | `POST /task-groups`                    |
| `createTaskGroupWithCodespace()`  | Create task group with codespace task  | Custom method                          |
| `updateTaskGroup()`               | Update task group                      | `PUT /project-tasks/task-groups/{id}`  |
| `deleteTaskGroup()`               | Delete task group                      | `DELETE /task-groups/{id}`             |
| `getAllProjectTasks()`            | Get all project tasks                  | `GET /project-tasks`                   |
| `getPaginatedProjectTasks()`      | Get paginated project tasks            | `GET /project-tasks/paginated`         |
| `getProjectTaskById()`            | Get project task by ID                 | `GET /project-tasks/{id}`              |
| `createProjectTask()`             | Create a new project task              | `POST /project-tasks`                  |
| `updateProjectTask()`             | Update project task                    | `PUT /project-tasks/{id}`              |
| `deleteProjectTask()`             | Delete project task                    | `DELETE /project-tasks/{id}`           |
| `generateTasks()`                 | Generate tasks for project             | `POST /project-tasks/generate-tasks`   |
| `getTasksByProject()`             | Get tasks by project                   | `GET /project-tasks/by-project/{id}`   |
| `updateTask()`                    | Update task with AI result             | `PUT /project-tasks/{id}`              |

## Detailed Method Documentation

### Task Groups Methods

#### 1. getAllTaskGroups()

Retrieves all task groups for the authenticated user.

##### Signature

```typescript
async getAllTaskGroups(): Promise<TaskGroup[]>
```

##### Response

```typescript
interface TaskGroup {
  id: string
  name: string
  description?: string
  user_id: string
  project_id: string
  created_at: string
  updated_at: string
  project_tasks: ProjectTask[]
  prd_content?: string
  raw_tasks?: {
    tasks: RawTask[]
    expanded_tasks: RawTask[]
  }
  codespace_task_id?: string
}

interface RawTask {
  id: number
  title: string
  description?: string
  priority?: string
  status?: string
}
```

##### Example

```typescript
const taskGroups = await tasks.getAllTaskGroups()

console.log(`Found ${taskGroups.length} task groups`)
taskGroups.forEach(group => {
  console.log(`- ${group.name} (${group.project_tasks?.length || 0} tasks)`)
  if (group.codespace_task_id) {
    console.log(`  Codespace Task: ${group.codespace_task_id}`)
  }
})
```

#### 2. getPaginatedTaskGroups()

Retrieves task groups with pagination support.

##### Signature

```typescript
async getPaginatedTaskGroups(params: PaginatedTaskGroupsRequest): Promise<PaginatedTaskGroupsResponse>
```

##### Parameters

```typescript
interface PaginatedTaskGroupsRequest {
  page?: number // Optional (default: 1)
  page_size?: number // Optional (default: 20)
  project_id?: string // Optional: Filter by project ID
}
```

##### Response

```typescript
interface PaginatedTaskGroupsResponse {
  status: string
  data: TaskGroup[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}
```

##### Example

```typescript
const response = await tasks.getPaginatedTaskGroups({
  page: 1,
  page_size: 10,
  project_id: 'project_123'
})

console.log(`Page ${response.pagination.page} of ${response.pagination.total_pages}`)
console.log(`Total: ${response.pagination.total} task groups`)

response.data.forEach(group => {
  console.log(`- ${group.name}`)
})
```

#### 3. getTaskGroupById()

Retrieves a specific task group by ID.

##### Signature

```typescript
async getTaskGroupById(taskGroupId: string): Promise<TaskGroup>
```

##### Parameters

- `taskGroupId` (string, required): The ID of the task group

##### Example

```typescript
const taskGroup = await tasks.getTaskGroupById('task_group_123')

console.log(`Task Group: ${taskGroup.name}`)
if (taskGroup.description) {
  console.log(`Description: ${taskGroup.description}`)
}
console.log(`Tasks: ${taskGroup.project_tasks?.length || 0}`)
```

#### 4. createTaskGroup()

Creates a new task group.

##### Signature

```typescript
async createTaskGroup(request: CreateTaskGroupRequest): Promise<TaskGroup>
```

##### Parameters

```typescript
interface CreateTaskGroupRequest {
  name: string // Required
  description?: string // Optional
  project_id: string // Required
  include_codespace_task?: boolean // Optional
  project_description?: string // Optional
}
```

##### Example

```typescript
const taskGroup = await tasks.createTaskGroup({
  name: 'User Authentication',
  description: 'Tasks related to user authentication and authorization',
  project_id: 'project_123'
})

console.log(`Created task group: ${taskGroup.id}`)
```

#### 5. createTaskGroupWithCodespace()

Creates a task group and optionally generates a codespace task from the project description.

##### Signature

```typescript
async createTaskGroupWithCodespace(
  request: CreateTaskGroupRequest,
  codespaceService: CodespaceService
): Promise<TaskGroup>
```

##### Parameters

- `request`: Same as `createTaskGroup()` but with optional `include_codespace_task` and `project_description`
- `codespaceService`: An instance of the CodespaceService

##### Example

```typescript
const taskGroup = await tasks.createTaskGroupWithCodespace(
  {
    name: 'E-commerce Features',
    description: 'Core e-commerce functionality',
    project_id: 'project_123',
    include_codespace_task: true,
    project_description: 'Implement shopping cart, checkout process, and payment integration'
  },
  codeguide.codespace
)

console.log(`Created task group: ${taskGroup.name}`)
if (taskGroup.codespace_task_id) {
  console.log(`Associated codespace task: ${taskGroup.codespace_task_id}`)
}
```

#### 6. updateTaskGroup()

Updates an existing task group.

##### Signature

```typescript
async updateTaskGroup(taskGroupId: string, request: UpdateTaskGroupRequest): Promise<TaskGroup>
```

##### Parameters

```typescript
interface UpdateTaskGroupRequest {
  project_id?: string
  prd_content?: string
  raw_tasks?: {
    tasks: RawTask[]
    expanded_tasks: RawTask[]
  }
  codespace_task_id?: string
}
```

##### Example

```typescript
const updatedGroup = await tasks.updateTaskGroup('task_group_123', {
  prd_content: 'Updated product requirements document...',
  codespace_task_id: 'codespace_task_456'
})

console.log(`Updated task group: ${updatedGroup.name}`)
```

#### 7. deleteTaskGroup()

Deletes a task group.

##### Signature

```typescript
async deleteTaskGroup(taskGroupId: string): Promise<{ status: string; message: string }>
```

##### Parameters

- `taskGroupId` (string, required): The ID of the task group to delete

##### Example

```typescript
const response = await tasks.deleteTaskGroup('task_group_123')

console.log(response.message) // "Task group deleted successfully"
```

### Project Tasks Methods

#### 8. getAllProjectTasks()

Retrieves all project tasks with optional filtering.

##### Signature

```typescript
async getAllProjectTasks(filters?: {
  task_group_id?: string
  parent_task_id?: string
  status?: string
}): Promise<ProjectTask[]>
```

##### Parameters

- `filters` (optional): Object containing filter criteria

##### Response

```typescript
interface ProjectTask {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  user_id: string
  task_group_id: string
  parent_task_id?: string
  ordinal: number
  created_at: string
  updated_at: string
  subtasks?: ProjectTask[]
}
```

##### Example

```typescript
// Get all tasks
const allTasks = await tasks.getAllProjectTasks()

// Filter by task group
const groupTasks = await tasks.getAllProjectTasks({
  task_group_id: 'task_group_123'
})

// Filter by status
const completedTasks = await tasks.getAllProjectTasks({
  status: 'completed'
})

console.log(`Found ${completedTasks.length} completed tasks`)
```

#### 9. getPaginatedProjectTasks()

Retrieves project tasks with pagination and advanced filtering.

##### Signature

```typescript
async getPaginatedProjectTasks(params: PaginatedProjectTasksRequest): Promise<PaginatedProjectTasksResponse>
```

##### Parameters

```typescript
interface PaginatedProjectTasksRequest {
  page?: number // Optional (default: 1)
  page_size?: number // Optional (default: 20)
  task_group_id?: string // Optional
  parent_task_id?: string // Optional
  status?: string // Optional
  search_query?: string // Optional
}
```

##### Response

```typescript
interface PaginatedProjectTasksResponse {
  status: string
  data: ProjectTask[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}
```

##### Example

```typescript
const response = await tasks.getPaginatedProjectTasks({
  page: 1,
  page_size: 15,
  status: 'in_progress',
  search_query: 'authentication'
})

console.log(`Found ${response.pagination.total} matching tasks`)
response.data.forEach(task => {
  console.log(`- ${task.title} (${task.status})`)
})
```

#### 10. getProjectTaskById()

Retrieves a specific project task by ID.

##### Signature

```typescript
async getProjectTaskById(taskId: string): Promise<ProjectTask>
```

##### Parameters

- `taskId` (string, required): The ID of the project task

##### Example

```typescript
const task = await tasks.getProjectTaskById('task_123')

console.log(`Task: ${task.title}`)
console.log(`Status: ${task.status}`)
console.log(`Priority: ${task.priority || 'Not set'}`)

if (task.subtasks && task.subtasks.length > 0) {
  console.log(`Subtasks: ${task.subtasks.length}`)
}
```

#### 11. createProjectTask()

Creates a new project task.

##### Signature

```typescript
async createProjectTask(request: CreateProjectTaskRequest): Promise<ProjectTask>
```

##### Parameters

```typescript
interface CreateProjectTaskRequest {
  title: string // Required
  description?: string // Optional
  task_group_id: string // Required
  parent_task_id?: string // Optional
  ordinal?: number // Optional
}
```

##### Example

```typescript
const task = await tasks.createProjectTask({
  title: 'Implement login API endpoint',
  description: 'Create RESTful API endpoint for user authentication',
  task_group_id: 'task_group_123',
  ordinal: 1
})

console.log(`Created task: ${task.id}`)
```

#### 12. updateProjectTask()

Updates an existing project task.

##### Signature

```typescript
async updateProjectTask(taskId: string, request: UpdateProjectTaskRequest): Promise<ProjectTask>
```

##### Parameters

```typescript
interface UpdateProjectTaskRequest {
  title?: string
  description?: string
  status?: string
  task_group_id?: string
  parent_task_id?: string
  ordinal?: number
}
```

##### Example

```typescript
const updatedTask = await tasks.updateProjectTask('task_123', {
  status: 'completed',
  description: 'Updated description with implementation details'
})

console.log(`Task status: ${updatedTask.status}`)
```

#### 13. deleteProjectTask()

Deletes a project task.

##### Signature

```typescript
async deleteProjectTask(taskId: string): Promise<{ status: string; message: string }>
```

##### Parameters

- `taskId` (string, required): The ID of the project task to delete

##### Example

```typescript
const response = await tasks.deleteProjectTask('task_123')

console.log(response.message) // "Task deleted successfully"
```

### Advanced Methods

#### 14. generateTasks()

Automatically generates tasks for a project using AI.

##### Signature

```typescript
async generateTasks(request: GenerateTasksRequest): Promise<GenerateTasksResponse>
```

##### Parameters

```typescript
interface GenerateTasksRequest {
  project_id: string // Required
}
```

##### Response

```typescript
interface GenerateTasksResponse {
  status: string
  message: string
  data?: {
    task_groups_created: number
    tasks_created: number
  }
}
```

##### Example

```typescript
const response = await tasks.generateTasks({
  project_id: 'project_123'
})

console.log(response.message)
if (response.data) {
  console.log(`Created ${response.data.task_groups_created} task groups`)
  console.log(`Created ${response.data.tasks_created} tasks`)
}
```

#### 15. getTasksByProject()

Retrieves all tasks and task groups for a specific project.

##### Signature

```typescript
async getTasksByProject(request: GetTasksByProjectRequest): Promise<GetTasksByProjectResponse>
```

##### Parameters

```typescript
interface GetTasksByProjectRequest {
  project_id: string // Required
  status?: string // Optional
  task_group_id?: string // Optional
}
```

##### Response

```typescript
interface GetTasksByProjectResponse {
  status: string
  data: {
    task_groups: TaskGroup[]
    tasks: ProjectTask[]
  }
}
```

##### Example

```typescript
const response = await tasks.getTasksByProject({
  project_id: 'project_123',
  status: 'in_progress'
})

console.log(`Project has ${response.data.task_groups.length} task groups`)
console.log(`Project has ${response.data.tasks.length} tasks`)

response.data.task_groups.forEach(group => {
  console.log(`- Group: ${group.name}`)
})
```

#### 16. updateTask()

Updates a task with AI-generated results or other fields.

##### Signature

```typescript
async updateTask(taskId: string, request: UpdateTaskRequest): Promise<UpdateTaskResponse>
```

##### Parameters

```typescript
interface UpdateTaskRequest {
  status?: string
  ai_result?: string // AI-generated content or results
  title?: string
  description?: string
}
```

##### Response

```typescript
interface UpdateTaskResponse {
  status: string
  message: string
  data: {
    task: ProjectTask
  }
}
```

##### Example

```typescript
const response = await tasks.updateTask('task_123', {
  status: 'completed',
  ai_result: 'AI-generated implementation suggestions and code review results'
})

console.log(response.message)
console.log(`Updated task: ${response.data.task.title}`)
```

## Error Handling

All methods throw errors for various failure conditions. Common error types include:

### Validation Errors

```typescript
try {
  await tasks.createTaskGroup({})
} catch (error) {
  console.error(error.message) // "name is required" or "project_id is required"
}
```

### Network/Server Errors

```typescript
try {
  await tasks.getProjectTaskById('invalid_id')
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
  await tasks.generateTasks({ project_id: 'large_project_id' })
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.error('Request timed out. The task generation might take longer.')
  }
}
```

## Complete Examples

### Example 1: Complete Task Management Workflow

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.dev',
  databaseApiKey: process.env.CODEGUIDE_API_KEY,
})

async function completeTaskWorkflow() {
  try {
    // 1. Create a task group with codespace integration
    const taskGroup = await codeguide.tasks.createTaskGroupWithCodespace(
      {
        name: 'API Development',
        description: 'RESTful API endpoints for user management',
        project_id: 'project_123',
        include_codespace_task: true,
        project_description: 'Create comprehensive REST API for user authentication, registration, and profile management'
      },
      codeguide.codespace
    )

    console.log(`Created task group: ${taskGroup.name}`)

    // 2. Create individual tasks
    const loginTask = await codeguide.tasks.createProjectTask({
      title: 'Implement login endpoint',
      description: 'POST /api/auth/login with JWT token generation',
      task_group_id: taskGroup.id,
      ordinal: 1
    })

    const registerTask = await codeguide.tasks.createProjectTask({
      title: 'Implement registration endpoint',
      description: 'POST /api/auth/register with email verification',
      task_group_id: taskGroup.id,
      ordinal: 2
    })

    console.log(`Created tasks: ${loginTask.title}, ${registerTask.title}`)

    // 3. Update task with AI-generated results
    await codeguide.tasks.updateTask(loginTask.id, {
      ai_result: 'Implemented secure login with bcrypt password hashing and JWT tokens',
      status: 'completed'
    })

    // 4. Get all tasks for the project
    const projectTasks = await codeguide.tasks.getTasksByProject({
      project_id: 'project_123'
    })

    console.log(`Project now has ${projectTasks.data.tasks.length} tasks`)
    console.log(`Project has ${projectTasks.data.task_groups.length} task groups`)

  } catch (error) {
    console.error('Workflow failed:', error.message)
  }
}

completeTaskWorkflow()
```

### Example 2: Paginated Task Management

```typescript
async function paginatedTaskManagement() {
  const taskGroupId = 'task_group_123'
  let currentPage = 1
  const pageSize = 10

  try {
    // Get paginated tasks
    const response = await codeguide.tasks.getPaginatedProjectTasks({
      page: currentPage,
      page_size: pageSize,
      task_group_id: taskGroupId
    })

    console.log(`Page ${currentPage} of ${response.pagination.total_pages}`)
    console.log(`Showing ${response.data.length} of ${response.pagination.total} tasks`)

    // Display tasks
    response.data.forEach(task => {
      console.log(`${task.ordinal}. ${task.title} - ${task.status}`)
      if (task.description) {
        console.log(`   ${task.description.substring(0, 100)}...`)
      }
    })

    // Load more pages if needed
    if (currentPage < response.pagination.total_pages) {
      currentPage++
      // Load next page...
    }

  } catch (error) {
    console.error('Failed to load paginated tasks:', error.message)
  }
}
```

### Example 3: Task Search and Filtering

```typescript
async function taskSearchAndFilter() {
  try {
    // Search for tasks
    const searchResults = await codeguide.tasks.getPaginatedProjectTasks({
      page: 1,
      page_size: 20,
      search_query: 'authentication',
      status: 'in_progress'
    })

    console.log(`Found ${searchResults.pagination.total} tasks matching "authentication"`)

    // Filter by task group
    const groupTasks = await codeguide.tasks.getAllProjectTasks({
      task_group_id: 'task_group_123',
      status: 'completed'
    })

    console.log(`Completed tasks in group: ${groupTasks.length}`)

    // Get tasks with subtasks
    const tasksWithSubtasks = groupTasks.filter(task =>
      task.subtasks && task.subtasks.length > 0
    )

    tasksWithSubtasks.forEach(task => {
      console.log(`Task: ${task.title}`)
      console.log(`Subtasks: ${task.subtasks?.length}`)
      task.subtasks?.forEach(subtask => {
        console.log(`  - ${subtask.title} (${subtask.status})`)
      })
    })

  } catch (error) {
    console.error('Task search failed:', error.message)
  }
}
```

## Best Practices

1. **Use Pagination** for large datasets to avoid memory issues
2. **Implement Proper Error Handling** with try-catch blocks and status code checking
3. **Use Ordinal Field** to maintain task order within groups
4. **Leverage Parent-Child Relationships** for complex task hierarchies
5. **Cache Task Data** when possible to reduce API calls
6. **Use Search Functionality** for finding specific tasks quickly
7. **Combine with Codespace Service** for AI-powered task creation and management

## Type Exports

The package exports the following types for TypeScript users:

```typescript
import type {
  TaskGroup,
  ProjectTask,
  RawTask,
  CreateTaskGroupRequest,
  UpdateTaskGroupRequest,
  CreateProjectTaskRequest,
  UpdateProjectTaskRequest,
  TaskGroupListResponse,
  TaskGroupResponse,
  ProjectTaskListResponse,
  ProjectTaskResponse,
  PaginatedTaskGroupsRequest,
  PaginatedTaskGroupsResponse,
  PaginatedProjectTasksRequest,
  PaginatedProjectTasksResponse,
  GenerateTasksRequest,
  GenerateTasksResponse,
  GetTasksByProjectRequest,
  GetTasksByProjectResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from '@codeguide/core'
```

## Related Documentation

- [Projects Service](./projects-service.md) - Project management
- [Codespace Service](./codespace-service.md) - AI-powered coding tasks
- [CodeGuide Client](./codeguide-client.md) - Client initialization

For more information, visit the [API documentation](https://docs.codeguide.dev) or check the [GitHub repository](https://github.com/codeguide/cli).