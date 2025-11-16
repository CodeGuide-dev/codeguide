# Starter Kits Service

The Starter Kits Service provides methods for retrieving starter kits that can be used to bootstrap new projects.

## Overview

The Starter Kits Service allows you to:
- Retrieve starter kits with optional filtering
- Filter starter kits by name or repository name
- Access starter kit metadata and project structures

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

// Access the starter kits service
const starterKits = codeguide.starterKits
```

## Authentication

The service supports multiple authentication methods with automatic priority handling:

1. **Database API Key** (recommended): `sk_...` format
2. **Legacy API Key**: Older API key format
3. **Clerk JWT Token**: JWT-based authentication

The service will automatically use the highest priority authentication method available.

## Methods Overview

| Method | Description | Endpoint |
|--------|-------------|----------|
| `getStarterKits()` | Get starter kits with optional filtering | `GET /starter-kits/` |

## Detailed Method Documentation

### getStarterKits()

Retrieves starter kits with optional filtering by name or repository name. Results are ordered by `ordinal` in ascending order.

#### Signature

```typescript
async getStarterKits(params?: GetStarterKitsRequest): Promise<StarterKit[]>
```

#### Parameters

```typescript
interface GetStarterKitsRequest {
  name?: string        // Optional: Filter by starter kit name
  repo_name?: string   // Optional: Filter by repository name
}
```

#### Returns

- `Promise<StarterKit[]>`: Array of starter kit objects

#### StarterKit Interface

```typescript
interface StarterKit {
  id: string                                    // Unique identifier (UUID)
  created_at: string                            // Creation timestamp (ISO 8601)
  updated_at: string                            // Last update timestamp (ISO 8601)
  name: string                                  // Starter kit name
  repo_name: string | null                      // Repository name (optional)
  kit_name: string | null                       // Kit name (optional)
  metadata: StarterKitMetadata | null           // Additional metadata (optional)
  project_structure: string | null               // Project structure information (optional)
  ordinal: number | null                        // Ordering value (used for sorting)
}
```

#### Example

```typescript
// Get all starter kits
const allStarterKits = await codeguide.starterKits.getStarterKits()

console.log(`Found ${allStarterKits.length} starter kits`)
allStarterKits.forEach(kit => {
  console.log(`- ${kit.name} (${kit.repo_name || 'No repo'})`)
})

// Filter by name
const reactKits = await codeguide.starterKits.getStarterKits({
  name: 'react',
})

console.log(`Found ${reactKits.length} React starter kits`)

// Filter by repository name
const githubKits = await codeguide.starterKits.getStarterKits({
  repo_name: 'github.com/example/repo',
})

// Combine filters
const filteredKits = await codeguide.starterKits.getStarterKits({
  name: 'nextjs',
  repo_name: 'github.com/vercel/next.js',
})
```

## Response Format

The API returns starter kits in the following format:

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "name": "Next.js Starter",
      "repo_name": "github.com/vercel/next.js",
      "kit_name": "nextjs-starter",
      "metadata": {
        "framework": "nextjs",
        "language": "typescript"
      },
      "project_structure": "src/\n  app/\n  components/\n  lib/",
      "ordinal": 1.0
    }
  ]
}
```

## Error Handling

The service handles errors automatically through the base service error handling:

- **401 Unauthorized**: Authentication failed
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

All errors are thrown as JavaScript `Error` objects with descriptive messages.

#### Example Error Handling

```typescript
try {
  const starterKits = await codeguide.starterKits.getStarterKits()
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    console.error('Please check your API key')
  } else if (error.message.includes('Rate limit')) {
    console.error('Too many requests. Please wait before retrying.')
  } else {
    console.error('Error fetching starter kits:', error.message)
  }
}
```

## Use Cases

### Listing Available Starter Kits

```typescript
// Get all available starter kits
const kits = await codeguide.starterKits.getStarterKits()

// Display them in order
kits.forEach((kit, index) => {
  console.log(`${index + 1}. ${kit.name}`)
  if (kit.repo_name) {
    console.log(`   Repository: ${kit.repo_name}`)
  }
  if (kit.metadata) {
    console.log(`   Metadata:`, kit.metadata)
  }
})
```

### Finding a Specific Starter Kit

```typescript
// Search for a specific starter kit
const nextjsKit = await codeguide.starterKits.getStarterKits({
  name: 'nextjs',
})

if (nextjsKit.length > 0) {
  const kit = nextjsKit[0]
  console.log(`Found: ${kit.name}`)
  if (kit.project_structure) {
    console.log('Project structure:')
    console.log(kit.project_structure)
  }
}
```

### Filtering by Repository

```typescript
// Get starter kits from a specific repository
const repoKits = await codeguide.starterKits.getStarterKits({
  repo_name: 'github.com/example/starters',
})

console.log(`Found ${repoKits.length} kits from the repository`)
```

## TypeScript Support

The service provides full TypeScript support with exported types:

```typescript
import {
  StarterKitsService,
  StarterKit,
  GetStarterKitsRequest,
  GetStarterKitsResponse,
} from '@codeguide/core'

// Use types for better type safety
const request: GetStarterKitsRequest = {
  name: 'react',
}

const kits: StarterKit[] = await codeguide.starterKits.getStarterKits(request)
```

## Notes

- Starter kits are ordered by `ordinal` in ascending order (lower values appear first)
- All query parameters are optional - omitting them will return all starter kits
- The `metadata` field can contain any JSON-serializable data
- The `project_structure` field typically contains a string representation of the directory structure

