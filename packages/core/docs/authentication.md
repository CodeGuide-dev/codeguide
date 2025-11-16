# Authentication

The CodeGuide client supports multiple authentication methods with automatic priority handling. This guide covers all available authentication options and how they work.

## Overview

The CodeGuide client automatically selects the best available authentication method based on priority:

1. **Database API Key** (Highest Priority) - Recommended
2. **Legacy API Key + User ID** (Medium Priority) - For backward compatibility
3. **Clerk JWT Token** (Lowest Priority) - For Clerk-based applications

## Authentication Methods

### 1. Database API Key (Recommended)

The recommended authentication method. Database API keys are prefixed with `sk_` and provide the most secure and flexible authentication.

#### Configuration

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key', // Must start with 'sk_'
})
```

#### Features

- Highest priority authentication method
- No user ID required
- Supports all API features
- Can be scoped and managed through the API

#### Getting Your Database API Key

1. Sign up at [codeguide.ai](https://codeguide.ai)
2. Navigate to API Keys section
3. Create a new API key (format: `sk_...`)
4. Copy and store securely

### 2. Legacy API Key + User ID

For backward compatibility with older integrations. Requires both an API key and user ID.

#### Configuration

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  apiKey: 'your_legacy_api_key',
  userId: 'your_user_id', // Required for legacy auth
})
```

#### Features

- Medium priority (used if database API key is not provided)
- Requires both `apiKey` and `userId`
- Backward compatible with older integrations

### 3. Clerk JWT Token

For applications using Clerk for authentication. Pass a valid Clerk JWT token.

#### Configuration

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  jwtToken: 'your_clerk_jwt_token',
})
```

#### Features

- Lowest priority (used if no other auth method is available)
- Requires valid Clerk JWT token
- Useful for Clerk-based applications

## Automatic Fallback

The client automatically falls back through authentication methods based on priority:

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_key',     // Will try this first (Priority 1)
  apiKey: 'legacy_key',         // Fallback if database key invalid (Priority 2)
  userId: 'user_id',            // Required for legacy auth
  jwtToken: 'jwt_token',        // Final fallback (Priority 3)
})
```

**Priority Order:**
1. Database API Key (`databaseApiKey` with `sk_` prefix)
2. Legacy API Key + User ID (`apiKey` + `userId`)
3. Clerk JWT Token (`jwtToken`)

## Authentication Validation

### Check Current Authentication Method

```typescript
const authMethod = codeguide.projects.getAuthenticationMethod()

if (authMethod) {
  console.log('Auth type:', authMethod.type)
  console.log('Priority:', authMethod.priority)
  console.log('Headers:', authMethod.headers)
} else {
  console.log('No authentication configured')
}
```

### Validate Authentication Configuration

```typescript
const validation = codeguide.projects.validateAuthentication()

if (validation.success) {
  console.log('Authentication is valid')
  console.log('Method:', validation.method?.type)
} else {
  console.error('Authentication error:', validation.error)
}
```

## Error Handling

### Authentication Errors

All authentication errors are thrown with descriptive messages:

```typescript
try {
  const projects = await codeguide.projects.getAllProjects()
} catch (error) {
  if (error.message.includes('401')) {
    // Authentication failed
    if (error.message.includes('Database API key')) {
      console.error('Invalid database API key')
    } else if (error.message.includes('Legacy API key')) {
      console.error('Invalid legacy API key or user ID')
    } else if (error.message.includes('Clerk JWT')) {
      console.error('Invalid or expired JWT token')
    }
  }
}
```

### Common Error Scenarios

#### Invalid Database API Key

```typescript
// Error: Database API key authentication failed: Invalid, expired, or inactive API key
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_invalid_key',
})
```

#### Missing User ID for Legacy Auth

```typescript
// Error: Legacy API key authentication requires both apiKey and userId
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  apiKey: 'legacy_key',
  // userId is missing
})
```

#### Invalid JWT Token

```typescript
// Error: Clerk JWT authentication failed: Invalid or expired token
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  jwtToken: 'expired_token',
})
```

## Best Practices

### 1. Use Environment Variables

Store API keys securely in environment variables:

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: process.env.CODEGUIDE_API_URL || 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY, // sk_...
})
```

### 2. Prefer Database API Keys

Use database API keys (`sk_...`) for new integrations:

```typescript
// ✅ Recommended
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key',
})

// ❌ Avoid if possible
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  apiKey: 'legacy_key',
  userId: 'user_id',
})
```

### 3. Handle Authentication Errors Gracefully

```typescript
async function makeRequest() {
  try {
    return await codeguide.projects.getAllProjects()
  } catch (error) {
    if (error.message.includes('401')) {
      // Retry with different auth method or show user-friendly error
      throw new Error('Please check your API credentials')
    }
    throw error
  }
}
```

### 4. Validate Before Making Requests

```typescript
const validation = codeguide.projects.validateAuthentication()

if (!validation.success) {
  console.error('Authentication not configured:', validation.error)
  return
}

// Proceed with API calls
const projects = await codeguide.projects.getAllProjects()
```

### 5. Rotate Keys Regularly

Regularly rotate your API keys for security:

```typescript
// Old key
const oldCodeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_old_key',
})

// Create new key via API
const newKey = await oldCodeguide.apiKeyEnhanced.createApiKey({
  name: 'New Production Key',
})

// Update to new key
const newCodeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: newKey.data.api_key,
})
```

## Security Considerations

### API Key Storage

- **Never commit API keys to version control**
- Use environment variables or secure key management services
- Rotate keys regularly
- Use different keys for different environments (dev, staging, production)

### Key Scoping

Database API keys can be scoped to specific permissions. Create keys with minimal required permissions:

```typescript
// Use scoped keys when possible
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_readonly_key', // Scoped to read-only operations
})
```

### Token Expiration

- JWT tokens expire after a set period
- Implement token refresh logic for Clerk-based applications
- Handle token expiration errors gracefully

## Examples

### Basic Setup

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})
```

### With Fallback

```typescript
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY,
  // Fallback to legacy auth if database key not available
  apiKey: process.env.LEGACY_API_KEY,
  userId: process.env.USER_ID,
})
```

### Clerk Integration

```typescript
import { useAuth } from '@clerk/nextjs'

function MyComponent() {
  const { getToken } = useAuth()
  
  const codeguide = new CodeGuide({
    baseUrl: 'https://api.codeguide.ai',
    jwtToken: await getToken(),
  })
  
  // Use codeguide...
}
```

## Related Documentation

- [CodeGuide Client](./codeguide-client.md) - Client initialization and configuration
- [Security Keys Service](./security-keys-service.md) - Managing provider API keys

