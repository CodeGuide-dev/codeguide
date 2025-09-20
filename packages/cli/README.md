# @codeguide/cli

A powerful CLI tool for code guidance with programmatic API access. Get intelligent code suggestions, project management, and API key management all from your command line.

## Features

- 🔑 **API Key Management**: Create, manage, and revoke API keys
- 📝 **Project Generation**: Create structured projects with documentation
- 🎯 **Task Management**: Organize and track development tasks
- 📊 **Usage Analytics**: Monitor your API usage and credits
- 🔍 **Repository Analysis**: Analyze code repositories
- 🎨 **Code Generation**: Generate code with AI assistance

## Installation

```bash
# Install globally
npm install -g @codeguide/cli

# Or install locally
npm install @codeguide/cli
```

## Quick Start

### 1. Authenticate

First, set up your API credentials:

```bash
# Using database API key (recommended)
export CODEGUIDE_DATABASE_API_KEY="sk_your_database_api_key"

# Or using legacy API key + user ID
export CODEGUIDE_API_KEY="your_api_key"
export CODEGUIDE_USER_ID="your_user_id"
```

### 2. Initialize a Project

```bash
# Create a new project
codeguide init my-project

# Or initialize in current directory
codeguide init .
```

### 3. Start Working

```bash
# View available tasks
codeguide task list

# Start working on a task
codeguide task start <task_id>

# Update task progress
codeguide task update <task_id> "your progress notes"
```

## Commands

### Project Management

```bash
# Initialize a new project
codeguide init <project-name>

# Start a new project interactively
codeguide start

# List all projects
codeguide project list

# Get project details
codeguide project get <project-id>
```

### Task Management

```bash
# List all tasks
codeguide task list

# Start working on a task
codeguide task start <task_id>

# Update task progress
codeguide task update <task_id> [progress-notes]

# Mark task as completed
codeguide task update <task_id> --status completed
```

### API Key Management

```bash
# List all API keys
codeguide api-key list

# Create a new API key
codeguide api-key create "My App Key"

# Revoke an API key
codeguide api-key revoke <key-id>

# Check API key permissions
codeguide api-key check-permission
```

### Usage & Analytics

```bash
# Check usage statistics
codeguide usage stats

# Check service health
codeguide health
```

### Authentication

```bash
# Store authentication credentials
codeguide auth login

# Check current authentication status
codeguide auth status

# Clear stored credentials
codeguide auth logout
```

## Configuration

### Environment Variables

```bash
# Required: API endpoint
CODEGUIDE_BASE_URL="https://api.codeguide.ai"

# Authentication (choose one)
CODEGUIDE_DATABASE_API_KEY="sk_your_database_api_key"
# OR
CODEGUIDE_API_KEY="your_api_key"
CODEGUIDE_USER_ID="your_user_id"
# OR
CODEGUIDE_JWT_TOKEN="your_jwt_token"

# Optional: Timeout in milliseconds
CODEGUIDE_TIMEOUT="3600000"
```

### Configuration File

Create a `.codeguide.json` file in your project root:

```json
{
  "baseUrl": "https://api.codeguide.ai",
  "databaseApiKey": "sk_your_database_api_key",
  "timeout": 3600000
}
```

## Project Structure

When you initialize a project, CodeGuide creates the following structure:

```
my-project/
├── AGENTS.md              # AI agent definitions
├── instructions.md        # Project getting started guide
├── tasks/                 # Task management
│   ├── pending/          # Pending tasks
│   ├── in_progress/      # Active tasks
│   └── completed/        # Completed tasks
├── project-outline.md    # Project outline
├── README.md             # Project documentation
└── .codeguide.json       # CodeGuide configuration
```

## Authentication Methods

CodeGuide supports multiple authentication methods with the following priority:

1. **Database API Key** (highest priority)
   ```bash
   export CODEGUIDE_DATABASE_API_KEY="sk_your_key"
   ```

2. **Legacy API Key + User ID**
   ```bash
   export CODEGUIDE_API_KEY="your_key"
   export CODEGUIDE_USER_ID="your_user_id"
   ```

3. **Clerk JWT Token** (lowest priority)
   ```bash
   export CODEGUIDE_JWT_TOKEN="your_jwt_token"
   ```

## Examples

### Basic Usage

```bash
# Initialize a new project
codeguide init my-web-app

# Change to project directory
cd my-web-app

# View tasks
codeguide task list

# Start first task
codeguide task start task_001

# Generate project outline
codeguide generate outline
```

### API Key Management

```bash
# Check if you can create API keys
codeguide api-key check-permission

# Create a new key for your application
codeguide api-key create "Production App Key"

# List all your keys
codeguide api-key list

# Revoke a compromised key
codeguide api-key revoke key_id_123
```

### Project Documentation

```bash
# Generate comprehensive project documentation
codeguide generate docs

# Create project outline
codeguide generate outline

# Generate AI agent definitions
codeguide generate agents
```

## Advanced Usage

### Using with Different Environments

```bash
# Development
export CODEGUIDE_BASE_URL="https://dev-api.codeguide.ai"
export CODEGUIDE_DATABASE_API_KEY="sk_dev_key"

# Production
export CODEGUIDE_BASE_URL="https://api.codeguide.ai"
export CODEGUIDE_DATABASE_API_KEY="sk_prod_key"
```

### Custom Timeouts

```bash
# Set custom timeout (default: 1 hour)
export CODEGUIDE_TIMEOUT="1800000"  # 30 minutes
```

## Error Handling

CodeGuide provides detailed error messages for common issues:

### Authentication Errors
```
❌ Authentication failed: Invalid, expired, or inactive API key
```

### Permission Errors
```
❌ Access denied: Insufficient permissions or subscription required
```

### Rate Limiting
```
❌ Rate limit exceeded: Too many requests. Please try again later.
```

### Usage Limits
```
❌ Usage limit exceeded: Check your credit balance
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- **Documentation**: [Main README](../../README.md)
- **Issues**: [GitHub Issues](https://github.com/CodeGuide-dev/codeguide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CodeGuide-dev/codeguide/discussions)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.