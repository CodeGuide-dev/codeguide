# @codeguide/cli

A powerful CLI tool for code guidance with programmatic API access. Get intelligent code suggestions, project management, and API key management all from your command line.

## Features

- 🔑 **API Key Management**: Create, manage, and revoke API keys.
- 🤖 **Codespace Tasks**: Create and manage AI-powered coding tasks directly from the CLI.
- 📝 **Project Management**: Initialize projects, list them, and view details.
- 🎯 **Task Management**: Organize and track development tasks.
- 🎨 **Code Generation**: Generate project outlines and documentation.
- 🔍 **Repository Analysis**: Analyze code repositories.
- 🔐 **External Token Management**: Securely store and manage external tokens (e.g., GitHub, GitLab).
- 💳 **Subscription Management**: Check your current subscription status.
- 📊 **Usage Analytics**: Monitor your API usage and credits.

## Installation

```bash
# Install globally
npm install -g @codeguide/cli@0.0.23

# Or install locally
npm install @codeguide/cli@0.0.23
```

## Quick Start

### 1. Authenticate

First, set up your API credentials. The CLI will prompt you if credentials are not found.

```bash
codeguide login
```

You can also set them via environment variables:
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

### 3. Create a Codespace Task

```bash
# Get your project ID
codeguide project list

# Create a task for the AI to work on
codeguide codespace create --project-id <your-project-id> --description "Implement user login via email and password"
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

### Codespace Tasks
```bash
# Create a new codespace task
codeguide codespace create --project-id <id> --description "My new feature"

# List codespace tasks for a project
codeguide codespace list --project-id <id>

# Get details for a specific codespace task
codeguide codespace get <task-id>
```

### Task Management

```bash
# List all tasks
codeguide task list

# Start working on a task
codeguide task update <task_id> --status in_progress

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

### External Token Management
```bash
# Store a new external token (e.g., for GitHub)
codeguide token store --platform github --token <ghp_token> --name "My GitHub Token"

# List all stored tokens
codeguide token list

# Revoke a stored token
codeguide token revoke <token-id>
```

### Subscription & Usage

```bash
# Show current subscription details
codeguide subscription show

# Check usage statistics
codeguide usage stats

# Check service health
codeguide health
```

### Authentication

```bash
# Interactive login with API key setup
codeguide login

# Direct API key authentication
codeguide login --api-key your-api-key

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
- **Core Package**: [@codeguide/core](../core/README.md)
- **Issues**: [GitHub Issues](https://github.com/CodeGuide-dev/codeguide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CodeGuide-dev/codeguide/discussions)

## License

MIT License - see the LICENSE file for details.
