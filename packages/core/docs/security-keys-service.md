# Security Keys Service

The Security Keys Service provides methods for securely managing provider API keys (OpenAI, Anthropic, etc.) and GitHub tokens. All keys are encrypted and stored securely.

## Overview

The Security Keys Service allows you to:
- Store and manage provider API keys (OpenAI, Anthropic, etc.)
- Store and manage GitHub personal access tokens
- Retrieve keys (with optional reveal option)
- Revoke/delete stored keys
- List all stored keys

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

// Access the security keys service
const securityKeys = codeguide.securityKeys
```

## Methods Overview

### Provider API Keys

| Method | Description | Endpoint |
|--------|-------------|----------|
| `createProviderAPIKey()` | Save a provider API key | `POST /security-keys/provider-api-key` |
| `getProviderAPIKey()` | Get a provider API key | `GET /security-keys/provider-api-key/{provider_key}` |
| `listProviderAPIKeys()` | List all provider API keys | `GET /security-keys/provider-api-keys` |
| `revokeProviderAPIKey()` | Delete a provider API key | `DELETE /security-keys/provider-api-key/{provider_key}` |

### GitHub Tokens

| Method | Description | Endpoint |
|--------|-------------|----------|
| `createGitHubToken()` | Save a GitHub token | `POST /security-keys/github-token` |
| `getGitHubToken()` | Get the GitHub token | `GET /security-keys/github-token` |
| `revokeGitHubToken()` | Delete the GitHub token | `DELETE /security-keys/github-token` |

## Detailed Method Documentation

### Provider API Keys

#### 1. createProviderAPIKey()

Saves a new provider API key. The key is encrypted and stored securely.

#### Signature

```typescript
async createProviderAPIKey(request: CreateProviderAPIKeyRequest): Promise<CreateProviderAPIKeyResponse>
```

#### Parameters

```typescript
interface CreateProviderAPIKeyRequest {
  provider_key: string    // Required: Provider key (e.g., 'openai', 'anthropic')
  api_key: string        // Required: The API key (minimum 10 characters)
}
```

#### Returns

```typescript
interface CreateProviderAPIKeyResponse {
  status: 'success'
  data: ProviderAPIKeyData
}

interface ProviderAPIKeyData {
  id: string
  created_at: string
  user_id: string
  name: string
  displayed_name: string
  value_masked: string        // Masked version of the key
  value?: string              // Only included when reveal=true
  object_value: {
    provider_id: string
  }
  encryption: string
  key_version: string
  provider_id: string
  provider_name: string
  provider_key: string
  provider_logo_src?: string  // Only in list endpoint
}
```

#### Validation

- `provider_key` is required
- `api_key` is required and must be at least 10 characters long
- Provider must exist in the system

#### Example

```typescript
// Store an OpenAI API key
const response = await codeguide.securityKeys.createProviderAPIKey({
  provider_key: 'openai',
  api_key: 'sk-your-openai-api-key-here',
})

console.log(`Stored key for ${response.data.provider_name}`)
console.log(`Masked value: ${response.data.value_masked}`)
```

#### 2. getProviderAPIKey()

Retrieves a provider API key by provider key.

#### Signature

```typescript
async getProviderAPIKey(providerKey: string, reveal: boolean = false): Promise<GetProviderAPIKeyResponse>
```

#### Parameters

- `providerKey` (string, required): The provider key (e.g., 'openai', 'anthropic')
- `reveal` (boolean, optional): Whether to reveal the actual API key (default: false)

#### Returns

```typescript
interface GetProviderAPIKeyResponse {
  status: 'success'
  data: ProviderAPIKeyData
}
```

#### Example

```typescript
// Get masked key (default)
const masked = await codeguide.securityKeys.getProviderAPIKey('openai')
console.log(`Masked key: ${masked.data.value_masked}`)

// Get revealed key
const revealed = await codeguide.securityKeys.getProviderAPIKey('openai', true)
console.log(`Actual key: ${revealed.data.value}`) // Only if reveal=true
```

#### 3. listProviderAPIKeys()

Lists all stored provider API keys.

#### Signature

```typescript
async listProviderAPIKeys(reveal: boolean = false): Promise<ListProviderAPIKeysResponse>
```

#### Parameters

- `reveal` (boolean, optional): Whether to reveal the actual API keys (default: false)

#### Returns

```typescript
interface ListProviderAPIKeysResponse {
  status: 'success'
  data: ProviderAPIKeyData[]
}
```

#### Example

```typescript
// List all keys (masked)
const keys = await codeguide.securityKeys.listProviderAPIKeys()

console.log(`Found ${keys.data.length} provider keys:`)
keys.data.forEach(key => {
  console.log(`- ${key.provider_name} (${key.provider_key})`)
  console.log(`  Masked: ${key.value_masked}`)
  if (key.provider_logo_src) {
    console.log(`  Logo: ${key.provider_logo_src}`)
  }
})

// List with revealed keys (use with caution)
const revealedKeys = await codeguide.securityKeys.listProviderAPIKeys(true)
revealedKeys.data.forEach(key => {
  console.log(`${key.provider_name}: ${key.value}`)
})
```

#### 4. revokeProviderAPIKey()

Deletes a provider API key.

#### Signature

```typescript
async revokeProviderAPIKey(providerKey: string): Promise<RevokeProviderAPIKeyResponse>
```

#### Parameters

- `providerKey` (string, required): The provider key to delete

#### Returns

```typescript
interface RevokeProviderAPIKeyResponse {
  status: string
  message: string
  revoked_provider_id: string
}
```

#### Example

```typescript
const result = await codeguide.securityKeys.revokeProviderAPIKey('openai')

console.log(result.status)   // "success"
console.log(result.message) // "Provider API key revoked successfully"
console.log(`Revoked provider ID: ${result.revoked_provider_id}`)
```

### GitHub Tokens

#### 5. createGitHubToken()

Saves a GitHub personal access token. The token is encrypted and stored securely.

#### Signature

```typescript
async createGitHubToken(request: CreateGitHubTokenRequest): Promise<CreateGitHubTokenResponse>
```

#### Parameters

```typescript
interface CreateGitHubTokenRequest {
  github_token: string    // Required: GitHub personal access token
}
```

#### Returns

```typescript
interface CreateGitHubTokenResponse {
  status: 'success'
  data: GitHubTokenData
}

interface GitHubTokenData {
  id: string
  created_at: string
  user_id: string
  name: string
  displayed_name: string
  value_masked: string        // Masked version of the token
  value?: string              // Only included when reveal=true
  object_value: {
    token_type: string
  }
  encryption: string
  key_version: string
}
```

#### Validation

- `github_token` is required
- Token must be a valid GitHub token format:
  - Prefixes: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, or `github_pat_`
  - Minimum length: 40 characters
- Token is validated with GitHub API

#### Example

```typescript
// Store a GitHub token
const response = await codeguide.securityKeys.createGitHubToken({
  github_token: 'ghp_your_github_personal_access_token_here',
})

console.log(`GitHub token stored`)
console.log(`Masked value: ${response.data.value_masked}`)
```

#### 6. getGitHubToken()

Retrieves the stored GitHub token.

#### Signature

```typescript
async getGitHubToken(reveal: boolean = false): Promise<GetGitHubTokenResponse>
```

#### Parameters

- `reveal` (boolean, optional): Whether to reveal the actual token (default: false)

#### Returns

```typescript
interface GetGitHubTokenResponse {
  status: 'success'
  data: GitHubTokenData
}
```

#### Example

```typescript
// Get masked token (default)
const masked = await codeguide.securityKeys.getGitHubToken()
console.log(`Masked token: ${masked.data.value_masked}`)

// Get revealed token
const revealed = await codeguide.securityKeys.getGitHubToken(true)
console.log(`Actual token: ${revealed.data.value}`) // Only if reveal=true
```

#### 7. revokeGitHubToken()

Deletes the stored GitHub token.

#### Signature

```typescript
async revokeGitHubToken(): Promise<RevokeGitHubTokenResponse>
```

#### Returns

```typescript
interface RevokeGitHubTokenResponse {
  status: string
  message: string
  revoked_at: string
}
```

#### Example

```typescript
const result = await codeguide.securityKeys.revokeGitHubToken()

console.log(result.status)     // "success"
console.log(result.message)    // "GitHub token revoked successfully"
console.log(`Revoked at: ${result.revoked_at}`)
```

## Error Handling

### Common Errors

#### Provider Not Found

```typescript
try {
  await codeguide.securityKeys.createProviderAPIKey({
    provider_key: 'invalid_provider',
    api_key: 'sk-key-here',
  })
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Provider not found. Please choose a valid provider.')
  }
}
```

#### Duplicate Key

```typescript
try {
  await codeguide.securityKeys.createProviderAPIKey({
    provider_key: 'openai',
    api_key: 'sk-key-here',
  })
} catch (error) {
  if (error.message.includes('already exists')) {
    console.error('API key for this provider already exists. Use update endpoint to change it.')
    // Or revoke the existing key first
    await codeguide.securityKeys.revokeProviderAPIKey('openai')
    // Then create the new one
  }
}
```

#### Invalid GitHub Token Format

```typescript
try {
  await codeguide.securityKeys.createGitHubToken({
    github_token: 'invalid-token',
  })
} catch (error) {
  if (error.message.includes('Invalid GitHub token format')) {
    console.error('Token must start with ghp_, gho_, ghu_, ghs_, ghr_, or github_pat_')
  }
}
```

#### Key Not Found

```typescript
try {
  await codeguide.securityKeys.getProviderAPIKey('openai')
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('No API key found for this provider')
  }
}
```

#### Authentication Errors

```typescript
try {
  await codeguide.securityKeys.listProviderAPIKeys()
} catch (error) {
  if (error.message.includes('401') || error.message.includes('Authentication')) {
    console.error('Authentication failed. Check your API credentials.')
  }
}
```

## Complete Examples

### Example 1: Managing Provider API Keys

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})

async function manageProviderKeys() {
  try {
    // 1. Store OpenAI API key
    const openaiKey = await codeguide.securityKeys.createProviderAPIKey({
      provider_key: 'openai',
      api_key: process.env.OPENAI_API_KEY!,
    })
    console.log(`Stored OpenAI key: ${openaiKey.data.value_masked}`)

    // 2. Store Anthropic API key
    const anthropicKey = await codeguide.securityKeys.createProviderAPIKey({
      provider_key: 'anthropic',
      api_key: process.env.ANTHROPIC_API_KEY!,
    })
    console.log(`Stored Anthropic key: ${anthropicKey.data.value_masked}`)

    // 3. List all stored keys
    const allKeys = await codeguide.securityKeys.listProviderAPIKeys()
    console.log(`\nStored ${allKeys.data.length} provider keys:`)
    allKeys.data.forEach(key => {
      console.log(`- ${key.provider_name}: ${key.value_masked}`)
    })

    // 4. Get a specific key (masked)
    const retrieved = await codeguide.securityKeys.getProviderAPIKey('openai')
    console.log(`\nRetrieved OpenAI key: ${retrieved.data.value_masked}`)

    // 5. Revoke a key
    await codeguide.securityKeys.revokeProviderAPIKey('anthropic')
    console.log('\nAnthropic key revoked')
  } catch (error) {
    console.error('Error:', error.message)
  }
}

manageProviderKeys()
```

### Example 2: Managing GitHub Tokens

```typescript
async function manageGitHubToken() {
  try {
    // 1. Store GitHub token
    const token = await codeguide.securityKeys.createGitHubToken({
      github_token: process.env.GITHUB_TOKEN!,
    })
    console.log(`GitHub token stored: ${token.data.value_masked}`)

    // 2. Retrieve token (masked)
    const retrieved = await codeguide.securityKeys.getGitHubToken()
    console.log(`Retrieved token: ${retrieved.data.value_masked}`)

    // 3. Use token in a codespace task
    const task = await codeguide.codespace.createCodespaceTaskV2({
      project_id: 'proj_123456',
      task_description: 'Implement new feature',
      github_token: process.env.GITHUB_TOKEN!, // Or retrieve with reveal=true
    })

    // 4. Revoke token when done
    await codeguide.securityKeys.revokeGitHubToken()
    console.log('GitHub token revoked')
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### Example 3: Key Rotation

```typescript
async function rotateProviderKey(providerKey: string, newApiKey: string) {
  try {
    // Check if key exists
    try {
      const existing = await codeguide.securityKeys.getProviderAPIKey(providerKey)
      console.log(`Existing key found: ${existing.data.value_masked}`)

      // Revoke old key
      await codeguide.securityKeys.revokeProviderAPIKey(providerKey)
      console.log('Old key revoked')
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw error
      }
      console.log('No existing key found')
    }

    // Store new key
    const newKey = await codeguide.securityKeys.createProviderAPIKey({
      provider_key: providerKey,
      api_key: newApiKey,
    })

    console.log(`New key stored: ${newKey.data.value_masked}`)
    return newKey
  } catch (error) {
    console.error('Key rotation failed:', error.message)
    throw error
  }
}

// Usage
await rotateProviderKey('openai', process.env.NEW_OPENAI_KEY!)
```

### Example 4: Security Audit

```typescript
async function securityAudit() {
  try {
    // List all provider keys
    const providerKeys = await codeguide.securityKeys.listProviderAPIKeys()
    console.log(`\nProvider API Keys (${providerKeys.data.length}):`)
    providerKeys.data.forEach(key => {
      console.log(`- ${key.provider_name} (${key.provider_key})`)
      console.log(`  Created: ${key.created_at}`)
      console.log(`  Masked: ${key.value_masked}`)
    })

    // Check GitHub token
    try {
      const githubToken = await codeguide.securityKeys.getGitHubToken()
      console.log(`\nGitHub Token:`)
      console.log(`  Created: ${githubToken.data.created_at}`)
      console.log(`  Masked: ${githubToken.data.value_masked}`)
    } catch (error) {
      if (error.message.includes('not found')) {
        console.log('\nGitHub Token: Not stored')
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Audit failed:', error.message)
  }
}
```

## Security Best Practices

### 1. Never Log Revealed Keys

```typescript
// ❌ Bad: Logging revealed keys
const key = await codeguide.securityKeys.getProviderAPIKey('openai', true)
console.log(key.data.value) // Never do this!

// ✅ Good: Only log masked values
const key = await codeguide.securityKeys.getProviderAPIKey('openai')
console.log(key.data.value_masked) // Safe to log
```

### 2. Use Environment Variables

```typescript
// ✅ Good: Store keys in environment variables
const key = await codeguide.securityKeys.createProviderAPIKey({
  provider_key: 'openai',
  api_key: process.env.OPENAI_API_KEY!, // From environment
})

// ❌ Bad: Hardcoding keys
const key = await codeguide.securityKeys.createProviderAPIKey({
  provider_key: 'openai',
  api_key: 'sk-hardcoded-key-here', // Never do this!
})
```

### 3. Rotate Keys Regularly

```typescript
// Implement key rotation schedule
async function rotateKeysMonthly() {
  const providers = ['openai', 'anthropic']
  
  for (const provider of providers) {
    // Generate new key (implementation depends on provider)
    const newKey = await generateNewKey(provider)
    
    // Rotate
    await rotateProviderKey(provider, newKey)
  }
}
```

### 4. Handle Errors Gracefully

```typescript
async function safeGetKey(providerKey: string) {
  try {
    return await codeguide.securityKeys.getProviderAPIKey(providerKey)
  } catch (error) {
    if (error.message.includes('not found')) {
      console.warn(`No key found for ${providerKey}`)
      return null
    }
    throw error
  }
}
```

### 5. Revoke Unused Keys

```typescript
async function cleanupUnusedKeys() {
  const keys = await codeguide.securityKeys.listProviderAPIKeys()
  
  // Implement logic to identify unused keys
  const unusedKeys = keys.data.filter(key => {
    // Your logic here
    return false // Placeholder
  })
  
  for (const key of unusedKeys) {
    await codeguide.securityKeys.revokeProviderAPIKey(key.provider_key)
    console.log(`Revoked unused key: ${key.provider_key}`)
  }
}
```

## Type Definitions

### Complete Type Reference

```typescript
// Provider API Key Types
interface CreateProviderAPIKeyRequest {
  provider_key: string
  api_key: string
}

interface ProviderAPIKeyData {
  id: string
  created_at: string
  user_id: string
  name: string
  displayed_name: string
  value_masked: string
  value?: string
  object_value: {
    provider_id: string
  }
  encryption: string
  key_version: string
  provider_id: string
  provider_name: string
  provider_key: string
  provider_logo_src?: string
}

// GitHub Token Types
interface CreateGitHubTokenRequest {
  github_token: string
}

interface GitHubTokenData {
  id: string
  created_at: string
  user_id: string
  name: string
  displayed_name: string
  value_masked: string
  value?: string
  object_value: {
    token_type: string
  }
  encryption: string
  key_version: string
}

// Response Types
interface CreateProviderAPIKeyResponse {
  status: 'success'
  data: ProviderAPIKeyData
}

interface GetProviderAPIKeyResponse {
  status: 'success'
  data: ProviderAPIKeyData
}

interface ListProviderAPIKeysResponse {
  status: 'success'
  data: ProviderAPIKeyData[]
}

interface RevokeProviderAPIKeyResponse {
  status: string
  message: string
  revoked_provider_id: string
}

interface CreateGitHubTokenResponse {
  status: 'success'
  data: GitHubTokenData
}

interface GetGitHubTokenResponse {
  status: 'success'
  data: GitHubTokenData
}

interface RevokeGitHubTokenResponse {
  status: string
  message: string
  revoked_at: string
}
```

## Related Documentation

- [CodeGuide Client](./codeguide-client.md) - Client initialization
- [Authentication](./authentication.md) - Authentication methods
- [Projects Service](./projects-service.md) - Project management
- [Codespace Service](./codespace-service.md) - Using keys in codespace tasks

