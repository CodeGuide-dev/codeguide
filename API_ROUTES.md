# CodeGuide API Documentation

## Overview

This document provides comprehensive documentation for all CodeGuide API routes, organized by functionality. The API uses FastAPI and requires authentication for all endpoints except public health checks.

## Authentication

All API endpoints require authentication using one of the following methods:

1. **API Key Authentication** (Primary):
   - Header: `X-API-Key: <your_api_key>`
   - Header: `X-User-ID: <user_id>`

2. **Bearer Token Authentication** (Fallback):
   - Header: `Authorization: Bearer <jwt_token>`

## Base URL

```
https://api.codeguide.app/v1
```

## API Routes Summary

### 1. Generation Routes (`/generate`)

#### POST `/generate/refine-prompt`
**Summary**: Refine a user prompt to make it more useful for generation

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "user_prompt": "string",
  "image_urls": ["string"] (optional)
}
```

**Response**:
```json
{
  "refined_prompt": "string"
}
```

#### POST `/generate/title`
**Summary**: Generate a title based on user input

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "description": "string",
  "is_deep_research": "boolean" (optional, default: false)
}
```

**Response**:
```json
{
  "title": "string"
}
```

#### POST `/generate/questionnaire`
**Summary**: Generate a questionnaire based on project context

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_context": "string"
}
```

**Response**:
```json
{
  "questions": ["string"]
}
```

#### POST `/generate/prd`
**Summary**: Generate a Project Requirements Document (PRD)

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "description": "string",
  "selected_tools": ["string"],
  "answers": {},
  "outline": "string" (optional)
}
```

**Response**:
```json
{
  "content": "string"
}
```

#### POST `/generate/category`
**Summary**: Suggest a category for a project based on its title

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "title": "string",
  "existing_categories": ["string"] (optional)
}
```

**Response**:
```json
{
  "category": "string"
}
```

#### POST `/generate/outline`
**Summary**: Generate an outline for a project document

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_type": "string",
  "description": "string",
  "selected_tools": ["string"],
  "answers": {},
  "custom_document_type": "string" (optional),
  "title": "string" (optional),
  "outline": "string" (optional),
  "prd": "string" (optional),
  "app_flow": "string" (optional),
  "tech_stack_doc": "string" (optional),
  "starter_kit": "string" (optional)
}
```

**Response**:
```json
{
  "outline": "string"
}
```

#### POST `/generate/document`
**Summary**: Generate a custom document for a project

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_type": "string" (optional),
  "description": "string",
  "selected_tools": ["string"],
  "answers": {},
  "outline": "string" (optional),
  "custom_document_type": "string" (optional),
  "prd": "string" (optional),
  "app_flow": "string" (optional),
  "tech_stack_doc": "string" (optional),
  "title": "string" (optional),
  "starter_kit": "string" (optional)
}
```

**Response**:
```json
{
  "content": "string"
}
```

#### POST `/generate/multiple-documents`
**Summary**: Generate multiple documents for a project in parallel

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_id": "string",
  "description": "string",
  "selected_tools": ["string"],
  "document_types": ["string"],
  "answers": {},
  "outline": "string" (optional),
  "prd": "string" (optional),
  "app_flow": "string" (optional),
  "tech_stack_doc": "string" (optional),
  "starter_kit": "string" (optional)
}
```

**Response**:
```json
{
  "success": "boolean",
  "error": "string" (optional)
}
```

#### POST `/generate/background`
**Summary**: Start background generation of multiple documents

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_id": "string",
  "document_types": ["string"] (optional)
}
```

**Response**:
```json
{
  "job_id": "string",
  "status": "string",
  "message": "string"
}
```

#### GET `/generate/background/{job_id}/status`
**Summary**: Check the status of a background document generation job

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "job_id": "string",
  "status": "string",
  "progress": {},
  "results": {},
  "error": "string" (optional)
}
```

### 2. Project Management Routes (`/projects`)

#### GET `/projects`
**Summary**: Get all projects for the authenticated user

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "user_id": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "project_documents": [],
      "category": {},
      "codie_tool": {}
    }
  ]
}
```

#### GET `/projects/paginated`
**Summary**: Get paginated projects with optional filtering

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)
- `search_query`: Search in title and description
- `status`: Filter by status
- `start_date`: Filter by start date (YYYY-MM-DD)
- `end_date`: Filter by end date (YYYY-MM-DD)
- `sort_by_date`: Sort by date (asc or desc, default: desc)

**Response**:
```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "total": "number",
    "page": "number",
    "page_size": "number",
    "total_pages": "number"
  }
}
```

#### GET `/projects/{project_id}`
**Summary**: Get a specific project by ID

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime",
    "project_documents": [],
    "category": {},
    "codie_tool": {}
  }
}
```

#### POST `/projects`
**Summary**: Create a new project

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "category_id": "string" (optional),
  "codie_tool_id": "string" (optional),
  "tools_selected": ["string"] (optional),
  "ai_questionaire": {} (optional),
  "project_outline": {} (optional),
  "github_url": "string" (optional)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### PUT `/projects/{project_id}`
**Summary**: Update an existing project

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "title": "string" (optional),
  "description": "string" (optional),
  "category_id": "string" (optional),
  "codie_tool_id": "string" (optional),
  "tools_selected": ["string"] (optional),
  "ai_questionaire": {} (optional),
  "project_outline": {} (optional),
  "github_url": "string" (optional),
  "status": "string" (optional)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### DELETE `/projects/{project_id}`
**Summary**: Delete a project

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Project deleted successfully"
}
```

### 3. Document Management Routes (`/document-types`)

#### GET `/document-types`
**Summary**: Get all active document types

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `key`: Filter by document type key (optional)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "key": "string",
      "name": "string",
      "description": "string",
      "is_active": "boolean",
      "ordinal": "number",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

### 4. AI Tools Routes (`/ai-tools`)

#### GET `/ai-tools`
**Summary**: Get all active AI tools

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `key`: Filter by tool key (optional)
- `category`: Filter by category (optional)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "key": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "is_active": "boolean",
      "ordinal": "number",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

### 5. Task Management Routes

#### 5.1 Task Groups (`/task-groups`)

#### GET `/task-groups`
**Summary**: Get all task groups for the authenticated user

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "user_id": "string",
      "project_id": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "project_tasks": []
    }
  ]
}
```

#### GET `/task-groups/paginated`
**Summary**: Get paginated task groups with optional filtering

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)
- `project_id`: Filter by project ID (optional)

**Response**:
```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "total": "number",
    "page": "number",
    "page_size": "number",
    "total_pages": "number"
  }
}
```

#### GET `/task-groups/{task_group_id}`
**Summary**: Get a specific task group by ID

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "project_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime",
    "project_tasks": []
  }
}
```

#### POST `/task-groups`
**Summary**: Create a new task group

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "project_id": "string"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "project_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### PUT `/task-groups/{task_group_id}`
**Summary**: Update an existing task group

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "name": "string" (optional),
  "description": "string" (optional),
  "project_id": "string" (optional)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "project_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### DELETE `/task-groups/{task_group_id}`
**Summary**: Delete a task group

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Task group deleted successfully"
}
```

#### 5.2 Project Tasks (`/project-tasks`)

#### GET `/project-tasks`
**Summary**: Get all project tasks for the authenticated user

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `task_group_id`: Filter by task group ID (optional)
- `parent_task_id`: Filter by parent task ID (optional)
- `status`: Filter by task status (optional)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "string",
      "user_id": "string",
      "task_group_id": "string",
      "parent_task_id": "string",
      "ordinal": "number",
      "created_at": "datetime",
      "updated_at": "datetime",
      "subtasks": []
    }
  ]
}
```

#### GET `/project-tasks/paginated`
**Summary**: Get paginated project tasks with optional filtering

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)
- `task_group_id`: Filter by task group ID (optional)
- `parent_task_id`: Filter by parent task ID (optional)
- `status`: Filter by task status (optional)
- `search_query`: Search in title and description (optional)

**Response**:
```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "total": "number",
    "page": "number",
    "page_size": "number",
    "total_pages": "number"
  }
}
```

#### GET `/project-tasks/{task_id}`
**Summary**: Get a specific project task by ID

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "user_id": "string",
    "task_group_id": "string",
    "parent_task_id": "string",
    "ordinal": "number",
    "created_at": "datetime",
    "updated_at": "datetime",
    "subtasks": []
  }
}
```

#### POST `/project-tasks`
**Summary**: Create a new project task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "task_group_id": "string",
  "parent_task_id": "string" (optional),
  "ordinal": "number" (optional)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "pending",
    "user_id": "string",
    "task_group_id": "string",
    "parent_task_id": "string",
    "ordinal": "number",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### PUT `/project-tasks/{task_id}`
**Summary**: Update an existing project task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "title": "string" (optional),
  "description": "string" (optional),
  "status": "string" (optional),
  "task_group_id": "string" (optional),
  "parent_task_id": "string" (optional),
  "ordinal": "number" (optional)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "user_id": "string",
    "task_group_id": "string",
    "parent_task_id": "string",
    "ordinal": "number",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### DELETE `/project-tasks/{task_id}`
**Summary**: Delete a project task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Project task deleted successfully"
}
```

### 6. Codespace Routes (`/codespace`)

#### POST `/codespace/tasks`
**Summary**: Create a new codespace task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "project_id": "string",
  "repository_url": "string",
  "task_description": "string",
  "model_id": "string" (optional),
  "deployment_config": {} (optional)
}
```

**Response**:
```json
{
  "id": "string",
  "project_id": "string",
  "repository_url": "string",
  "task_description": "string",
  "status": "pending",
  "user_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### GET `/codespace/tasks/{task_id}`
**Summary**: Get a specific codespace task by ID

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "id": "string",
  "project_id": "string",
  "repository_url": "string",
  "task_description": "string",
  "status": "string",
  "user_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deployment": {},
  "model": {}
}
```

#### GET `/codespace/tasks`
**Summary**: Get all codespace tasks for the authenticated user

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `project_id`: Filter by project ID (optional)
- `status`: Filter by status (optional)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "project_id": "string",
      "repository_url": "string",
      "task_description": "string",
      "status": "string",
      "user_id": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### PUT `/codespace/tasks/{task_id}`
**Summary**: Update a codespace task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "task_description": "string" (optional),
  "status": "string" (optional),
  "deployment_config": {} (optional)
}
```

**Response**:
```json
{
  "id": "string",
  "project_id": "string",
  "repository_url": "string",
  "task_description": "string",
  "status": "string",
  "user_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### DELETE `/codespace/tasks/{task_id}`
**Summary**: Delete a codespace task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Codespace task deleted successfully"
}
```

### 7. Repository Analysis Routes (`/repository-analysis`)

#### POST `/repository-analysis/analyze`
**Summary**: Analyze a GitHub repository

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "repository_url": "string",
  "generate_documents": "boolean" (default: false),
  "create_codespace_task": "boolean" (default: false),
  "project_id": "string" (optional)
}
```

**Response**:
```json
{
  "task_id": "string",
  "status": "pending",
  "message": "Repository analysis started"
}
```

#### GET `/repository-analysis/tasks/{task_id}`
**Summary**: Get repository analysis task status

**Headers**:
- None required

**Response**:
```json
{
  "task_id": "string",
  "status": "string",
  "message": "string",
  "progress": "number" (optional)
}
```

#### GET `/repository-analysis/tasks/{task_id}/result`
**Summary**: Get repository analysis task result

**Headers**:
- None required

**Response**:
```json
{
  "task_id": "string",
  "status": "string",
  "result": {
    "repository": {},
    "documents": [],
    "statistics": {}
  }
}
```

#### GET `/repository-analysis/repositories`
**Summary**: List all repositories

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 10)

**Response**:
```json
{
  "repositories": [],
  "total": "number"
}
```

#### GET `/repository-analysis/repositories/{repo_id}`
**Summary**: Get repository details by ID

**Headers**:
- Authorization or API key required

**Response**:
```json
{
  "id": "string",
  "repository_url": "string",
  "user_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "analysis_results": {}
}
```

#### DELETE `/repository-analysis/repositories/{repo_id}`
**Summary**: Delete a repository

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Repository deleted successfully"
}
```

### 8. Usage Tracking Routes (`/usage`)

#### POST `/usage/track`
**Summary**: Track LLM usage with detailed credit tracking

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "model_key": "string",
  "input_tokens": "number",
  "output_tokens": "number",
  "call_seconds": "number" (optional),
  "cost_amount": "number" (optional)
}
```

**Response**:
```json
{
  "success": "boolean",
  "credits_used": "number",
  "remaining_credits": "number",
  "message": "string"
}
```

#### GET `/usage/credit-balance`
**Summary**: Get user's credit balance

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "user_id": "string",
  "total_consumed": "number",
  "total_allotted": "number",
  "remaining_credits": "number",
  "utilization_percentage": "number",
  "billing_cycle_start": "datetime",
  "billing_cycle_end": "datetime",
  "subscription": {
    "plan": "string",
    "status": "string"
  }
}
```

#### GET `/usage/credit-check`
**Summary**: Check if user has enough credits for a potential operation

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `model_key`: Model identifier (required)
- `input_tokens`: Estimated input tokens (optional)
- `output_tokens`: Estimated output tokens (optional)
- `call_seconds`: Estimated call duration in seconds (optional)

**Response**:
```json
{
  "has_sufficient_credits": "boolean",
  "estimated_cost": "number",
  "remaining_credits": "number",
  "model_key": "string"
}
```

#### GET `/usage/summary`
**Summary**: Get detailed usage summary

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `start_date`: Start date in YYYY-MM-DD format (optional)
- `end_date`: End date in YYYY-MM-DD format (optional)

**Response**:
```json
{
  "user_id": "string",
  "period": {
    "start_date": "string",
    "end_date": "string"
  },
  "usage_summary": {
    "total_credits_used": "number",
    "total_calls": "number",
    "model_breakdown": {},
    "daily_usage": []
  },
  "subscription": {
    "plan": "string",
    "status": "string"
  }
}
```

#### GET `/usage/authorization`
**Summary**: Get user authorization status

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "user_id": "string",
  "subscription": {
    "plan": "string",
    "status": "string",
    "features": []
  },
  "usage_limits": {
    "monthly_credits": "number",
    "max_calls_per_day": "number"
  },
  "permissions": []
}
```

#### GET `/usage/free-user-status`
**Summary**: Check free user credit status

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "is_free_user": "boolean",
  "has_available_credits": "boolean",
  "credits_remaining": "number",
  "credits_expire_at": "datetime"
}
```

#### GET `/usage/calculate`
**Summary**: Calculate usage cost without tracking

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `model_key`: Model identifier (required)
- `input_tokens`: Input tokens used (optional)
- `output_tokens`: Output tokens used (optional)
- `call_seconds`: Call duration in seconds (optional)
- `cost_amount`: Custom cost amount (optional)

**Response**:
```json
{
  "model_key": "string",
  "estimated_cost": "number",
  "calculation_breakdown": {
    "input_cost": "number",
    "output_cost": "number",
    "time_cost": "number",
    "total_cost": "number
  }
}
```

#### POST `/usage/codespace/track`
**Summary**: Track LLM usage for codespace task

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "codespace_task_id": "string",
  "model_key": "string",
  "input_tokens": "number",
  "output_tokens": "number",
  "call_seconds": "number" (optional),
  "cost_amount": "number" (optional)
}
```

**Response**:
```json
{
  "id": "string",
  "codespace_task_id": "string",
  "user_id": "string",
  "model_key": "string",
  "input_tokens": "number",
  "output_tokens": "number",
  "call_seconds": "number",
  "cost_amount": "number",
  "created_at": "datetime"
}
```

#### GET `/usage/codespace/task/{codespace_task_id}`
**Summary**: Get codespace task usage

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "codespace_task_id": "string",
  "total_usage": {
    "total_input_tokens": "number",
    "total_output_tokens": "number",
    "total_call_seconds": "number",
    "total_cost": "number"
  },
  "usage_records": []
}
```

#### GET `/usage/health`
**Summary**: Health check for usage system

**Headers**:
- None required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "datetime",
  "version": "string"
}
```

### 9. API Usage Logs Routes (`/api-usage-logs`)

#### GET `/api-usage-logs`
**Summary**: Get API usage logs for the authenticated user

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `start_date`: Start date in YYYY-MM-DD format (optional)
- `end_date`: End date in YYYY-MM-DD format (optional)
- `endpoint`: Filter by endpoint (optional)
- `method`: Filter by HTTP method (optional)
- `limit`: Maximum number of records to return (default: 100)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "user_id": "string",
      "endpoint": "string",
      "method": "string",
      "timestamp": "datetime",
      "status_code": "number",
      "response_time": "number"
    }
  ]
}
```

### 10. User Management Routes (`/users`)

#### GET `/users/me`
**Summary**: Get current user information

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 11. Codespace Models Routes (`/codespace-models`)

#### GET `/codespace-models`
**Summary**: Get all available codespace models

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "provider": {
        "id": "string",
        "name": "string"
      },
      "capabilities": [],
      "pricing": {}
    }
  ]
}
```

### 12. Notifications Routes (`/notifications`)

#### GET `/notifications`
**Summary**: Get user notifications

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Query Parameters**:
- `unread_only`: Filter by unread notifications only (default: false)
- `limit`: Maximum number of notifications to return (default: 50)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "user_id": "string",
      "type": "string",
      "title": "string",
      "message": "string",
      "is_read": "boolean",
      "created_at": "datetime"
    }
  ]
}
```

#### PUT `/notifications/{notification_id}/read`
**Summary**: Mark notification as read

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

### 13. Coolify Routes (`/coolify`)

#### GET `/coolify/applications`
**Summary**: Get Coolify applications

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "url": "string",
      "created_at": "datetime"
    }
  ]
}
```

#### POST `/coolify/deploy`
**Summary**: Deploy application to Coolify

**Headers**:
- `Authorization` or `X-API-Key` + `X-User-ID` (required)

**Request Body**:
```json
{
  "application_id": "string",
  "environment": "string",
  "config": {}
}
```

**Response**:
```json
{
  "status": "success",
  "deployment_id": "string",
  "message": "Deployment started"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting to ensure fair usage. Limits vary by endpoint and user subscription tier.

## Webhooks

The API supports webhooks for real-time notifications about:
- Task completion
- Document generation status
- Usage alerts
- Deployment status

Contact support to configure webhooks for your account.

## SDKs

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Go

See the documentation for installation and usage instructions.