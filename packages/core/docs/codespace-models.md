# Codespace Models

The Codespace Models API provides methods for querying and managing LLM models and providers used in codespace tasks. This documentation covers all model and provider management functionality.

## Overview

Codespace models are AI models that can be used for code generation and implementation tasks. Each model belongs to a provider (e.g., OpenAI, Anthropic) and supports different execution modes.

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

// Access codespace models through the codespace service
const models = await codeguide.codespace.getCodespaceModels()
```

## Concepts

### Models

A codespace model represents an AI model that can be used for code generation. Models have:
- **ID**: Unique identifier (UUID)
- **Name**: Human-readable name
- **Provider**: The provider that owns the model
- **Execution Mode**: The type of tasks the model supports
- **Base URLs**: API endpoints for the model

### Providers

A provider represents an LLM service provider (e.g., OpenAI, Anthropic). Providers have:
- **ID**: Unique identifier (UUID)
- **Name**: Provider name (e.g., "OpenAI", "Anthropic")
- **Key**: Provider key (e.g., "openai", "anthropic")
- **Logo**: Provider logo URL

### Execution Modes

Models support different execution modes:
- **`implementation`**: Full code implementation
- **`docs-only`**: Documentation generation only
- **`opencode`**: Open code execution mode
- **`claude-code`**: Claude-specific code mode

## Methods Overview

| Method | Description | Endpoint |
|--------|-------------|----------|
| `getCodespaceModels()` | Get all models with optional filtering | `GET /api/codespace-models/models` |
| `getCodespaceModel()` | Get a specific model by ID | `GET /api/codespace-models/models/{id}` |
| `getLLMModelProviders()` | Get all providers | `GET /api/codespace-models/providers` |
| `getLLMModelProvider()` | Get a specific provider by ID | `GET /api/codespace-models/providers/{id}` |
| `getModelsByProvider()` | Get all models for a provider | `GET /api/codespace-models/providers/{id}/models` |

## Detailed Method Documentation

### 1. getCodespaceModels()

Retrieves all available codespace models with optional filtering by provider or execution mode.

#### Signature

```typescript
async getCodespaceModels(query?: GetCodespaceModelsQuery): Promise<GetCodespaceModelsResponse>
```

#### Parameters

```typescript
interface GetCodespaceModelsQuery {
  provider_id?: string        // Optional: Filter by provider ID
  execution_mode?: string     // Optional: Filter by execution mode
}
```

#### Returns

```typescript
interface GetCodespaceModelsResponse extends Array<CodespaceModelWithProvider> {}

interface CodespaceModelWithProvider {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
  provider?: LLMModelProviderInDB
}
```

#### Example

```typescript
// Get all models
const allModels = await codeguide.codespace.getCodespaceModels()
console.log(`Found ${allModels.length} models`)

// Filter by provider
const openaiModels = await codeguide.codespace.getCodespaceModels({
  provider_id: 'provider_openai_id',
})

// Filter by execution mode
const implementationModels = await codeguide.codespace.getCodespaceModels({
  execution_mode: 'implementation',
})

// Filter by both
const filteredModels = await codeguide.codespace.getCodespaceModels({
  provider_id: 'provider_openai_id',
  execution_mode: 'implementation',
})

// Display models
allModels.forEach(model => {
  console.log(`${model.name} (${model.provider?.name}) - ${model.execution_mode}`)
})
```

### 2. getCodespaceModel()

Retrieves a specific codespace model by its ID.

#### Signature

```typescript
async getCodespaceModel(modelId: string): Promise<GetCodespaceModelResponse>
```

#### Parameters

- `modelId` (string, required): The UUID of the model

#### Returns

```typescript
interface GetCodespaceModelResponse extends CodespaceModelWithProvider {}
```

#### Example

```typescript
const model = await codeguide.codespace.getCodespaceModel('model_uuid_here')

console.log(`Model: ${model.name}`)
console.log(`Provider: ${model.provider?.name}`)
console.log(`Execution Mode: ${model.execution_mode}`)
console.log(`Base URL: ${model.base_url}`)

if (model.completion_base_url) {
  console.log(`Completion URL: ${model.completion_base_url}`)
}
```

### 3. getLLMModelProviders()

Retrieves all available LLM model providers.

#### Signature

```typescript
async getLLMModelProviders(): Promise<GetLLMModelProvidersResponse>
```

#### Returns

```typescript
interface GetLLMModelProvidersResponse extends Array<LLMModelProviderInDB> {}

interface LLMModelProviderInDB {
  id: string
  created_at: string
  name?: string
  key?: string
  logo_src?: string
}
```

#### Example

```typescript
const providers = await codeguide.codespace.getLLMModelProviders()

console.log(`Found ${providers.length} providers:`)
providers.forEach(provider => {
  console.log(`- ${provider.name} (${provider.key})`)
  if (provider.logo_src) {
    console.log(`  Logo: ${provider.logo_src}`)
  }
})
```

### 4. getLLMModelProvider()

Retrieves a specific LLM model provider by its ID.

#### Signature

```typescript
async getLLMModelProvider(providerId: string): Promise<GetLLMModelProviderResponse>
```

#### Parameters

- `providerId` (string, required): The UUID of the provider

#### Returns

```typescript
interface GetLLMModelProviderResponse extends LLMModelProviderInDB {}
```

#### Example

```typescript
const provider = await codeguide.codespace.getLLMModelProvider('provider_uuid_here')

console.log(`Provider: ${provider.name}`)
console.log(`Key: ${provider.key}`)
console.log(`Created: ${provider.created_at}`)

if (provider.logo_src) {
  console.log(`Logo: ${provider.logo_src}`)
}
```

### 5. getModelsByProvider()

Retrieves all models for a specific provider.

#### Signature

```typescript
async getModelsByProvider(providerId: string): Promise<GetModelsByProviderResponse>
```

#### Parameters

- `providerId` (string, required): The UUID of the provider

#### Returns

```typescript
interface GetModelsByProviderResponse extends Array<CodespaceModelInDB> {}

interface CodespaceModelInDB {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
}
```

#### Example

```typescript
// First, get the provider ID
const providers = await codeguide.codespace.getLLMModelProviders()
const openaiProvider = providers.find(p => p.key === 'openai')

if (openaiProvider) {
  // Get all models for OpenAI
  const openaiModels = await codeguide.codespace.getModelsByProvider(openaiProvider.id)

  console.log(`Found ${openaiModels.length} OpenAI models:`)
  openaiModels.forEach(model => {
    console.log(`- ${model.name}`)
    console.log(`  Execution Mode: ${model.execution_mode}`)
    console.log(`  Base URL: ${model.base_url}`)
  })
}
```

## Complete Examples

### Example 1: Discover Available Models

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})

async function discoverModels() {
  try {
    // Get all providers
    const providers = await codeguide.codespace.getLLMModelProviders()
    console.log(`Found ${providers.length} providers\n`)

    // For each provider, get their models
    for (const provider of providers) {
      console.log(`\n${provider.name} (${provider.key}):`)
      
      const models = await codeguide.codespace.getModelsByProvider(provider.id)
      
      models.forEach(model => {
        console.log(`  - ${model.name}`)
        console.log(`    Mode: ${model.execution_mode}`)
        console.log(`    ID: ${model.id}`)
      })
    }
  } catch (error) {
    console.error('Error discovering models:', error.message)
  }
}

discoverModels()
```

### Example 2: Find Models by Execution Mode

```typescript
async function findModelsByMode() {
  const executionModes = ['implementation', 'docs-only', 'opencode', 'claude-code']

  for (const mode of executionModes) {
    console.log(`\nModels supporting ${mode}:`)
    
    const models = await codeguide.codespace.getCodespaceModels({
      execution_mode: mode,
    })

    models.forEach(model => {
      console.log(`  - ${model.name} (${model.provider?.name})`)
    })
  }
}
```

### Example 3: Model Selection for Task

```typescript
async function selectModelForTask(executionMode: 'implementation' | 'docs-only') {
  // Get all models that support the execution mode
  const availableModels = await codeguide.codespace.getCodespaceModels({
    execution_mode: executionMode,
  })

  if (availableModels.length === 0) {
    throw new Error(`No models available for ${executionMode} mode`)
  }

  // Select the first available model (or implement your selection logic)
  const selectedModel = availableModels[0]

  console.log(`Selected model: ${selectedModel.name}`)
  console.log(`Provider: ${selectedModel.provider?.name}`)
  console.log(`Model ID: ${selectedModel.id}`)

  return selectedModel
}

// Use the selected model in a codespace task
async function createTaskWithSelectedModel() {
  const model = await selectModelForTask('implementation')

  const task = await codeguide.codespace.createCodespaceTaskV2({
    project_id: 'proj_123456',
    task_description: 'Implement user authentication',
    execution_mode: 'implementation',
    model_name: model.name,
  })

  console.log(`Task created: ${task.task_id}`)
}
```

### Example 4: Provider Information Display

```typescript
async function displayProviderInfo() {
  const providers = await codeguide.codespace.getLLMModelProviders()

  for (const provider of providers) {
    console.log(`\n${provider.name}`)
    console.log(`Key: ${provider.key}`)
    console.log(`ID: ${provider.id}`)

    // Get provider details
    const providerDetails = await codeguide.codespace.getLLMModelProvider(provider.id)
    
    // Get models for this provider
    const models = await codeguide.codespace.getModelsByProvider(provider.id)
    console.log(`Models: ${models.length}`)
    
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.execution_mode})`)
    })
  }
}
```

## Error Handling

### Model Not Found

```typescript
try {
  const model = await codeguide.codespace.getCodespaceModel('invalid_id')
} catch (error) {
  if (error.message.includes('404') || error.message.includes('not found')) {
    console.error('Model not found')
  } else {
    console.error('Error:', error.message)
  }
}
```

### Provider Not Found

```typescript
try {
  const provider = await codeguide.codespace.getLLMModelProvider('invalid_id')
} catch (error) {
  if (error.message.includes('404') || error.message.includes('not found')) {
    console.error('Provider not found')
  } else {
    console.error('Error:', error.message)
  }
}
```

### Authentication Errors

```typescript
try {
  const models = await codeguide.codespace.getCodespaceModels()
} catch (error) {
  if (error.message.includes('401') || error.message.includes('Authentication')) {
    console.error('Authentication failed. Check your API key.')
  } else {
    console.error('Error:', error.message)
  }
}
```

## Type Definitions

### Complete Type Reference

```typescript
// Model with provider information
interface CodespaceModelWithProvider {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
  provider?: LLMModelProviderInDB
}

// Model without provider (from getModelsByProvider)
interface CodespaceModelInDB {
  id: string
  created_at: string
  key?: string
  name?: string
  provider_id?: string
  base_url?: string
  completion_base_url?: string
  execution_mode?: 'opencode' | 'claude-code' | 'docs-only' | 'implementation'
  logo_src?: string
}

// Provider
interface LLMModelProviderInDB {
  id: string
  created_at: string
  name?: string
  key?: string
  logo_src?: string
}

// Query parameters
interface GetCodespaceModelsQuery {
  provider_id?: string
  execution_mode?: string
}

// Response types
interface GetCodespaceModelsResponse extends Array<CodespaceModelWithProvider> {}
interface GetCodespaceModelResponse extends CodespaceModelWithProvider {}
interface GetLLMModelProvidersResponse extends Array<LLMModelProviderInDB> {}
interface GetLLMModelProviderResponse extends LLMModelProviderInDB {}
interface GetModelsByProviderResponse extends Array<CodespaceModelInDB> {}
```

## Implementation Guide

This section provides step-by-step implementation guides for common use cases when working with codespace models.

### Basic Implementation: Getting All Models

The simplest way to get all available models:

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})

// Get all available models
async function getAllModels() {
  try {
    const models = await codeguide.codespace.getCodespaceModels()
    console.log(`Found ${models.length} total models`)
    
    // Process each model
    models.forEach(model => {
      console.log(`- ${model.name}`)
      console.log(`  Provider: ${model.provider?.name}`)
      console.log(`  Execution Mode: ${model.execution_mode}`)
      console.log(`  ID: ${model.id}`)
    })
    
    return models
  } catch (error) {
    console.error('Failed to get models:', error.message)
    throw error
  }
}
```

### Implementation: Getting Models with Caching

For better performance, implement caching to avoid repeated API calls:

```typescript
class ModelCache {
  private modelsCache: GetCodespaceModelsResponse | null = null
  private providersCache: GetLLMModelProvidersResponse | null = null
  private cacheTimestamp: number = 0
  private cacheTTL: number = 5 * 60 * 1000 // 5 minutes

  constructor(private codeguide: CodeGuide) {}

  async getModels(forceRefresh = false): Promise<GetCodespaceModelsResponse> {
    const now = Date.now()
    
    if (!forceRefresh && this.modelsCache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.modelsCache
    }

    this.modelsCache = await this.codeguide.codespace.getCodespaceModels()
    this.cacheTimestamp = now
    return this.modelsCache
  }

  async getProviders(forceRefresh = false): Promise<GetLLMModelProvidersResponse> {
    const now = Date.now()
    
    if (!forceRefresh && this.providersCache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.providersCache
    }

    this.providersCache = await this.codeguide.codespace.getLLMModelProviders()
    this.cacheTimestamp = now
    return this.providersCache
  }

  clearCache() {
    this.modelsCache = null
    this.providersCache = null
    this.cacheTimestamp = 0
  }
}

// Usage
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: process.env.CODEGUIDE_API_KEY!,
})

const cache = new ModelCache(codeguide)

// First call - fetches from API
const models1 = await cache.getModels()

// Second call within 5 minutes - returns cached data
const models2 = await cache.getModels()

// Force refresh
const models3 = await cache.getModels(true)
```

### Implementation: Filtering Models by Execution Mode

Get models that support a specific execution mode:

```typescript
async function getModelsByExecutionMode(
  executionMode: 'implementation' | 'docs-only' | 'opencode' | 'claude-code'
) {
  try {
    const models = await codeguide.codespace.getCodespaceModels({
      execution_mode: executionMode,
    })

    if (models.length === 0) {
      throw new Error(`No models found for execution mode: ${executionMode}`)
    }

    return models
  } catch (error) {
    console.error(`Error getting models for ${executionMode}:`, error.message)
    throw error
  }
}

// Usage examples
const implementationModels = await getModelsByExecutionMode('implementation')
const docsOnlyModels = await getModelsByExecutionMode('docs-only')
```

### Implementation: Getting Models by Provider

Get all models for a specific provider:

```typescript
async function getModelsByProviderKey(providerKey: string) {
  try {
    // First, get all providers to find the one we want
    const providers = await codeguide.codespace.getLLMModelProviders()
    const provider = providers.find(p => p.key === providerKey)

    if (!provider) {
      throw new Error(`Provider not found: ${providerKey}`)
    }

    // Get all models for this provider
    const models = await codeguide.codespace.getModelsByProvider(provider.id)
    
    return {
      provider,
      models,
    }
  } catch (error) {
    console.error(`Error getting models for provider ${providerKey}:`, error.message)
    throw error
  }
}

// Usage
const openaiData = await getModelsByProviderKey('openai')
console.log(`OpenAI has ${openaiData.models.length} models`)
openaiData.models.forEach(model => {
  console.log(`- ${model.name} (${model.execution_mode})`)
})
```

### Implementation: Getting a Specific Model by ID

Retrieve detailed information about a specific model:

```typescript
async function getModelDetails(modelId: string) {
  try {
    const model = await codeguide.codespace.getCodespaceModel(modelId)
    
    return {
      id: model.id,
      name: model.name,
      provider: model.provider?.name,
      providerKey: model.provider?.key,
      executionMode: model.execution_mode,
      baseUrl: model.base_url,
      completionBaseUrl: model.completion_base_url,
      logo: model.logo_src || model.provider?.logo_src,
    }
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error(`Model with ID ${modelId} not found`)
    }
    throw error
  }
}

// Usage
const modelDetails = await getModelDetails('model_uuid_here')
console.log('Model Details:', modelDetails)
```

### Implementation: Building a Model Selection Utility

Create a utility class for model selection:

```typescript
class ModelSelector {
  constructor(private codeguide: CodeGuide) {}

  /**
   * Get the best model for a given execution mode
   */
  async selectBestModel(
    executionMode: 'implementation' | 'docs-only' | 'opencode' | 'claude-code',
    preferredProvider?: string
  ) {
    const models = await this.codeguide.codespace.getCodespaceModels({
      execution_mode: executionMode,
    })

    if (models.length === 0) {
      throw new Error(`No models available for execution mode: ${executionMode}`)
    }

    // If a preferred provider is specified, try to find a model from that provider
    if (preferredProvider) {
      const preferredModel = models.find(
        m => m.provider?.key === preferredProvider
      )
      if (preferredModel) {
        return preferredModel
      }
      console.warn(
        `Preferred provider ${preferredProvider} not available, using fallback`
      )
    }

    // Return the first available model
    return models[0]
  }

  /**
   * Get all available models grouped by provider
   */
  async getModelsGroupedByProvider() {
    const providers = await this.codeguide.codespace.getLLMModelProviders()
    const grouped: Record<string, {
      provider: LLMModelProviderInDB
      models: CodespaceModelInDB[]
    }> = {}

    for (const provider of providers) {
      const models = await this.codeguide.codespace.getModelsByProvider(provider.id)
      grouped[provider.key || provider.id] = {
        provider,
        models,
      }
    }

    return grouped
  }

  /**
   * Check if a model supports a specific execution mode
   */
  async modelSupportsExecutionMode(
    modelId: string,
    executionMode: string
  ): Promise<boolean> {
    try {
      const model = await this.codeguide.codespace.getCodespaceModel(modelId)
      return model.execution_mode === executionMode
    } catch (error) {
      return false
    }
  }
}

// Usage
const selector = new ModelSelector(codeguide)

// Select best model for implementation tasks
const bestModel = await selector.selectBestModel('implementation', 'openai')
console.log(`Selected: ${bestModel.name}`)

// Get models grouped by provider
const grouped = await selector.getModelsGroupedByProvider()
Object.entries(grouped).forEach(([key, data]) => {
  console.log(`${data.provider.name}: ${data.models.length} models`)
})
```

### Implementation: Error Handling Pattern

Comprehensive error handling for model operations:

```typescript
async function getModelsWithErrorHandling() {
  try {
    const models = await codeguide.codespace.getCodespaceModels()
    return { success: true, data: models, error: null }
  } catch (error: any) {
    // Handle different error types
    if (error.message?.includes('401') || error.message?.includes('Authentication')) {
      return {
        success: false,
        data: null,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed. Please check your API key.',
          originalError: error.message,
        },
      }
    }

    if (error.message?.includes('403') || error.message?.includes('Permission')) {
      return {
        success: false,
        data: null,
        error: {
          type: 'PERMISSION_ERROR',
          message: 'You do not have permission to access models.',
          originalError: error.message,
        },
      }
    }

    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return {
        success: false,
        data: null,
        error: {
          type: 'RATE_LIMIT_ERROR',
          message: 'Rate limit exceeded. Please try again later.',
          originalError: error.message,
        },
      }
    }

    // Generic error
    return {
      success: false,
      data: null,
      error: {
        type: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred while fetching models.',
        originalError: error.message,
      },
    }
  }
}

// Usage
const result = await getModelsWithErrorHandling()
if (result.success) {
  console.log(`Found ${result.data.length} models`)
} else {
  console.error(`Error: ${result.error.message}`)
}
```

### Implementation: React Hook Example

Example React hook for fetching models:

```typescript
import { useState, useEffect } from 'react'
import { CodeGuide } from '@codeguide/core'

interface UseModelsOptions {
  executionMode?: string
  providerId?: string
  autoFetch?: boolean
}

export function useModels(options: UseModelsOptions = {}) {
  const { executionMode, providerId, autoFetch = true } = options
  const [models, setModels] = useState<GetCodespaceModelsResponse>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchModels = async () => {
    setLoading(true)
    setError(null)

    try {
      const codeguide = new CodeGuide({
        baseUrl: 'https://api.codeguide.ai',
        databaseApiKey: process.env.REACT_APP_CODEGUIDE_API_KEY!,
      })

      const query: GetCodespaceModelsQuery = {}
      if (executionMode) query.execution_mode = executionMode
      if (providerId) query.provider_id = providerId

      const fetchedModels = await codeguide.codespace.getCodespaceModels(query)
      setModels(fetchedModels)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchModels()
    }
  }, [executionMode, providerId, autoFetch])

  return {
    models,
    loading,
    error,
    refetch: fetchModels,
  }
}

// Usage in a React component
function ModelList() {
  const { models, loading, error, refetch } = useModels({
    executionMode: 'implementation',
  })

  if (loading) return <div>Loading models...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Available Models ({models.length})</h2>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {models.map(model => (
          <li key={model.id}>
            {model.name} - {model.provider?.name} ({model.execution_mode})
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Best Practices

1. **Cache Provider and Model Lists**: Cache provider and model information to reduce API calls
2. **Filter Server-Side**: Use query parameters to filter models rather than filtering client-side
3. **Handle Missing Models**: Always check if models are available before creating tasks
4. **Validate Execution Modes**: Ensure the selected model supports your desired execution mode
5. **Error Handling**: Implement proper error handling for missing models or providers

## Use Cases

### Selecting a Model for a Task

```typescript
async function selectAppropriateModel(taskType: 'implementation' | 'docs-only') {
  // Get models that support the task type
  const models = await codeguide.codespace.getCodespaceModels({
    execution_mode: taskType,
  })

  // Implement your selection logic (e.g., prefer certain providers)
  const preferredProvider = models.find(m => m.provider?.key === 'openai')
  return preferredProvider || models[0]
}
```

### Building a Model Selector UI

```typescript
async function buildModelSelector() {
  const providers = await codeguide.codespace.getLLMModelProviders()
  const modelMap = new Map()

  for (const provider of providers) {
    const models = await codeguide.codespace.getModelsByProvider(provider.id)
    modelMap.set(provider.id, {
      provider,
      models,
    })
  }

  return Array.from(modelMap.values())
}
```

## Related Documentation

- [Codespace Service](./codespace-service.md) - Complete codespace task documentation
- [Projects Service](./projects-service.md) - Project management
- [CodeGuide Client](./codeguide-client.md) - Client initialization

