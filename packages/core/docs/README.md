---
layout: home

hero:
  name: "@codeguide/core"
  text: "TypeScript SDK"
  tagline: Complete TypeScript SDK for integrating CodeGuide functionality into your applications
  actions:
    - theme: brand
      text: Get Started
      link: /codeguide-client
    - theme: alt
      text: View on GitHub
      link: https://github.com/CodeGuide-dev/codeguide

features:
  - title: 🔑 Multiple Authentication Methods
    details: Database API keys, legacy keys, and JWT tokens with automatic fallback
  - title: 📝 Project Management
    details: Create, update, and manage projects programmatically with full CRUD operations
  - title: 🤖 Codespace Tasks
    details: Create and manage AI-powered coding tasks with support for multiple execution modes
  - title: 🎯 Model Management
    details: Query and manage LLM models and providers for your codespace tasks
  - title: 🔐 Security Keys
    details: Securely manage provider API keys and GitHub tokens with encryption
  - title: 🛡️ TypeScript Support
    details: Full type safety and IntelliSense support for all API methods
---

## Quick Start

### Installation

```bash
npm install @codeguide/core
```

### Basic Usage

```typescript
import { CodeGuide } from '@codeguide/core'

// Initialize the CodeGuide client
const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_database_api_key', // Recommended
})

// Access services
const projects = await codeguide.projects.getAllProjects()
const tasks = await codeguide.codespace.getCodespaceTasksByProject({
  project_id: 'your_project_id'
})
```

## Documentation Structure

### Core Components

- **[CodeGuide Client](./codeguide-client.md)** - Main client class and initialization
- **[Authentication](./authentication.md)** - Authentication methods and configuration

### Services

- **[Projects Service](./projects-service.md)** - Project management and repository connections
- **[Codespace Service](./codespace-service.md)** - AI-powered coding tasks and workflows
- **[Codespace Models](./codespace-models.md)** - LLM model providers and model management
- **[Security Keys Service](./security-keys-service.md)** - Provider API keys and GitHub token management
- **[Usage Service](./usage-service.md)** - Usage tracking and authorization

## Features

- 🔑 **Multiple Authentication Methods** - Database API keys, legacy keys, and JWT tokens
- 📝 **Project Management** - Create, update, and manage projects programmatically
- 🤖 **Codespace Tasks** - Create and manage AI-powered coding tasks
- 🎯 **Model Management** - Query and manage LLM models and providers
- 🔐 **Security Keys** - Securely manage provider API keys and GitHub tokens
- 📊 **Usage Tracking** - Monitor API usage and credits
- 🛡️ **TypeScript Support** - Full type safety and IntelliSense

## Getting Started

1. **Install the package**: `npm install @codeguide/core`
2. **Get your API key**: Sign up at [codeguide.ai](https://codeguide.ai) to get your API key
3. **Initialize the client**: See [CodeGuide Client](./codeguide-client.md) for setup instructions
4. **Authenticate**: See [Authentication](./authentication.md) for authentication options
5. **Start building**: Explore the service documentation to learn about available features

## Common Use Cases

### Creating a Project

```typescript
const project = await codeguide.projects.createProject({
  title: 'My New Project',
  description: 'Project description here'
})
```

### Creating a Codespace Task

```typescript
const task = await codeguide.codespace.createCodespaceTaskV2({
  project_id: project.id,
  task_description: 'Implement user authentication',
  execution_mode: 'implementation'
})
```

### Managing Security Keys

```typescript
// Store a provider API key
await codeguide.securityKeys.createProviderAPIKey({
  provider_key: 'openai',
  api_key: 'sk-your-openai-key'
})

// Store a GitHub token
await codeguide.securityKeys.createGitHubToken({
  github_token: 'ghp_your_github_token'
})
```

## Support

- **GitHub**: [CodeGuide Repository](https://github.com/CodeGuide-dev/codeguide)
- **Issues**: [GitHub Issues](https://github.com/CodeGuide-dev/codeguide/issues)
- **Documentation**: This documentation site

## License

MIT License - see the LICENSE file for details.
