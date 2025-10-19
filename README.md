# CodeGuide

A comprehensive toolkit for AI-powered code guidance and project management. Includes both a CLI tool and a programmatic API for seamless integration into your development workflow.

## Packages

### 🔧 [@codeguide/cli](packages/cli/README.md) - Command Line Interface

A powerful CLI tool for code guidance with full project management capabilities.

**Features:**
- 🤖 **Codespace Tasks**: Create and manage AI-powered coding tasks directly from the CLI.
- 📝 **Project Management**: Initialize projects, list them, and view details.
- 🔐 **External Token Management**: Securely store and manage external tokens (e.g., GitHub, GitLab).
- 🔑 **API Key Management**: Create, manage, and revoke API keys.
- 💳 **Subscription Management**: Check your current subscription status.
- 📊 **Usage Analytics**: Monitor your API usage and credits.
- 🎨 **Code Generation**: Generate project outlines and documentation.

**Installation:**
```bash
npm install -g @codeguide/cli
```

### 📚 [@codeguide/core](packages/core/README.md) - Programmatic API

The core package with TypeScript interfaces and services for integrating CodeGuide into your applications.

**Features:**
- 🤖 **Codespace Tasks**: Create and manage AI-powered coding tasks and workflows.
- 🔐 **External Token Management**: Securely store and manage external tokens (e.g., GitHub, GitLab).
- 💳 **Subscription Management**: Programmatically manage user subscriptions.
- 🔑 **API Key Management**: Full CRUD operations for API keys.
- 📝 **Project Management**: Create and manage projects programmatically.
- 🎨 **Code Generation**: Generate code, documentation, and more with AI assistance.
- 🛡️ **TypeScript Support**: Full type safety and IntelliSense.

**Installation:**
```bash
npm install @codeguide/core
```

## Quick Start

### CLI Usage

```bash
# Install CLI
npm install -g @codeguide/cli

# Authenticate (will prompt for key)
codeguide login

# Create a new project
codeguide init my-project

# Create an AI-powered task
codeguide codespace create --project-id <id> --description "Implement user auth"
```

### Programmatic Usage

```typescript
// Install core package
npm install @codeguide/core

import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.ai',
  databaseApiKey: 'sk_your_key'
})

// Create a codespace task for an existing project
const task = await codeguide.codespace.createCodespaceTaskV2({
  project_id: "your_project_id",
  task_description: "Implement a new feature for real-time notifications",
});

console.log(`Created task: ${task.task_id}`);
```

## Documentation

| Package | Description | Link |
|---------|-------------|------|
| **CLI** | Command-line interface with full documentation | [README](packages/cli/README.md) |
| **Core** | Programmatic API with TypeScript support | [README](packages/core/README.md) |

## Core Services

The core package provides access to all API services:

- **ApiKeyEnhanced Service**: Manage API keys.
- **Codespace Service**: Create and manage AI-powered coding tasks.
- **ExternalToken Service**: Manage external API tokens (GitHub, etc.).
- **Generation Service**: Generate titles, outlines, and documents.
- **Projects Service**: Create and manage projects.
- **RepositoryAnalysis Service**: Analyze code repositories.
- **Subscription Service**: Manage user subscriptions.
- **Tasks Service**: Task management and tracking.
- **Usage Service**: Usage tracking and credit management.
- **CancellationFunnel Service**: Handle subscription cancellation flows.

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/CodeGuide-dev/codeguide.git
cd codeguide

# Install dependencies
npm install

# Build all packages
npm run build

# Link for local development
npm run dev:link
```

### Available Scripts

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:cli

# Run CLI in development mode
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run lint` and `npm run test`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v0.0.23

- Added **Codespace service** for AI-powered task execution.
- Added **External Token service** for managing third-party API keys (GitHub, GitLab).
- Added **Subscription service** for managing user subscriptions.
- Added **Cancellation Funnel service** to handle the cancellation process.
- Expanded all services with new methods and improved validation.
- Updated documentation across all packages to reflect new features.

### v0.0.11

- Bump version to 0.0.11
- Add --api-key flag to login command for non-interactive authentication
- Add interactive docs setup command with API key creation links
- Fix TypeScript error in cancellation funnel service

### v0.0.10

- Enhanced task management system
- Added codespace service for development environments
- Improved error handling and type safety

### v0.0.1

- Initial release
- Project creation with AI-generated documentation
- Task management system
- Authentication and usage tracking
- CLI and programmatic API interfaces