# CodeGuide CLI

A modern CLI tool for AI-powered code guidance and project management. Create new projects, generate documentation, and manage development tasks with intelligent AI assistance.

## Features

- **🚀 Project Creation**: Create new projects with AI-generated structure and documentation
- **📝 Documentation Generation**: Automatically generate project documentation
- **🎯 Task Management**: AI-powered task creation and tracking
- **🔧 Authentication**: Secure API key management
- **📊 Usage Tracking**: Monitor API usage and credits
- **⚡ TypeScript**: Full type safety and IntelliSense support
- **🎨 Interactive Mode**: User-friendly command-line interface

## Installation

### Global Installation (Recommended)

```bash
npm install -g @codeguide/cli
```

### Development Installation

```bash
git clone https://github.com/CodeGuide-dev/codeguide.git
cd codeguide
npm install
npm run build
```

## Quick Start

### 1. Login

```bash
codeguide login --api-key your-api-key
```

### 2. Create a New Project

```bash
# Interactive mode
codeguide start

# With prompt
codeguide start "Create a React app with TypeScript and Tailwind CSS"

# In current directory
codeguide start --current-codebase
```

### 3. View and Manage Tasks

```bash
# List all tasks
codeguide task list

# Start working on a task
codeguide task start <task_id>

# Update task progress
codeguide task update <task_id> "Completed authentication module"

# Mark task as completed
codeguide task update <task_id> --status completed
```

## Commands

### Project Management

```bash
# Start a new project
codeguide start [prompt] [options]

# Initialize current directory
codeguide init

# Generate documentation
codeguide generate [options]
```

### Task Management

```bash
# List tasks
codeguide task list [options]

# Start a task
codeguide task start <task_id>

# Update a task
codeguide task update <task_id> [options]
```

### Authentication

```bash
# Login with API key
codeguide login --api-key your-api-key

# Check health
codeguide health
```

### Usage Management

```bash
# Check credit balance
codeguide usage balance

# View usage summary
codeguide usage summary

# Check authorization status
codeguide usage auth
```

## CLI Options

### Start Command

```bash
codeguide start [prompt] [options]

Options:
  -l, --language <language>    Programming language
  -c, --context <context>      Additional context
  -v, --verbose               Verbose output
  -o, --output <file>         Output file (default: README.md)
  --api-url <url>             API URL
  --api-key <key>             API key
  --current-codebase          Generate in current directory
  -h, --help                  Display help
```

### Task Commands

```bash
codeguide task list [options]

Options:
  --status <status>           Filter by status (pending, in_progress, completed)
  --page <number>             Page number
  --page-size <number>        Page size

codeguide task update <task_id> [options]

Options:
  --status <status>           Update status
  --ai-result <result>        AI completion result
  --title <title>             Update title
  --description <description> Update description
```

## Project Structure

When you create a new project with `codeguide start`, it generates:

```
my-project/
├── codeguide.json           # Project configuration
├── AGENTS.md               # AI agent guidelines
├── instructions.md         # Getting started guide
└── documentation/          # Generated documentation
    ├── project-outline.md
    ├── technical-specs.md
    └── implementation-plan.md
```

## Configuration

### Environment Variables

- `CODEGUIDE_API_URL`: API base URL (default: https://api.codeguide.dev)
- `CODEGUIDE_API_KEY`: API key for authentication

### Authentication

The CLI supports multiple authentication methods:

1. **Database API Key** (highest priority): `sk_...` format
2. **Legacy API Key** (medium priority): Traditional API keys
3. **Clerk JWT Token** (lowest priority): JWT tokens

Authentication configuration is automatically saved locally for convenience.

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

### Project Structure

```
codeguide/
├── packages/
│   ├── core/              # Core package (@codeguide/core)
│   │   ├── dist/          # Built JavaScript files
│   │   ├── services/      # API services
│   │   ├── types.ts       # TypeScript types
│   │   └── api-service.ts # Main API service
│   └── cli/               # CLI package (@codeguide/cli)
│       ├── dist/          # Built JavaScript files
│       ├── commands.ts    # CLI commands
│       ├── utils/         # Utility functions
│       └── index.ts       # CLI entry point
├── package.json           # Root workspace configuration
└── README.md              # This file
```

## API Usage

### Programmatic Usage

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide(
  {
    baseUrl: 'https://api.codeguide.dev',
    databaseApiKey: 'your-api-key',
  },
  {
    language: 'typescript',
    verbose: true,
  }
)

// Check health
const isHealthy = await codeguide.isHealthy()

// Generate project title
const title = await codeguide.generation.generateTitle({
  description: 'A React app with TypeScript',
})

// Generate project outline
const outline = await codeguide.generation.generateOutline({
  project_type: 'react',
  description: 'A React app with TypeScript',
  title: title.title,
})
```

### Core Services

The core package provides access to all API services:

- **Generation Service**: Generate titles, outlines, and documents
- **Projects Service**: Create and manage projects
- **Tasks Service**: Task management and tracking
- **Usage Service**: Usage tracking and credit management
- **Repository Service**: Code analysis and insights

## Examples

### Create a React Project

```bash
codeguide start "Create a React app with TypeScript, Tailwind CSS, and routing" --language react
```

### Generate Documentation for Existing Project

```bash
cd existing-project
codeguide init
codeguide generate --current-codebase
```

### Check Usage and Credits

```bash
codeguide usage balance
codeguide usage summary --start-date 2024-01-01 --end-date 2024-12-31
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**

   ```bash
   # Check your API key
   codeguide login --api-key your-api-key

   # Verify API health
   codeguide health
   ```

2. **Permission Denied**
   - Ensure your API key has sufficient permissions
   - Check your subscription status

3. **Build Errors**

   ```bash
   # Clean build
   npm run build

   # Check types
   npm run typecheck
   ```

### Support

- **Documentation**: [GitHub Wiki](https://github.com/CodeGuide-dev/codeguide/wiki)
- **Issues**: [GitHub Issues](https://github.com/CodeGuide-dev/codeguide/issues)
- **API Documentation**: [API Docs](https://api.codeguide.dev/docs)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run dev:prepare` to lint and typecheck
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v0.0.1

- Initial release
- Project creation with AI-generated documentation
- Task management system
- Authentication and usage tracking
- CLI and programmatic API interfaces
