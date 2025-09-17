# CodeGuide CLI

A TypeScript CLI tool for code guidance with programmatic API access.

## Features

- **Core Package**: Programmatic API for code guidance
- **CLI Interface**: Command-line tool for quick access
- **API Service**: Configurable API client with health checks
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI Usage

```bash
# Ask for code guidance
codeguide ask "How do I create a React component?"

# Specify programming language
codeguide ask "How to sort an array?" --language javascript

# Add context
codeguide ask "Fix this bug" --context "I'm getting a TypeError in my Node.js app"

# Check API health
codeguide health

# Use custom API URL
codeguide ask "Help with Python" --api-url https://api.example.com
```

### Programmatic Usage

```typescript
import { CodeGuide } from 'codeguide';

const codeguide = new CodeGuide({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
}, {
  language: 'typescript',
  verbose: true
});

// Get guidance
const response = await codeguide.getGuidance('How do I implement async/await?');
console.log(response.response);

// Check health
const isHealthy = await codeguide.isHealthy();
```

## Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run CLI in development mode
npm run dev

# Type checking
npm run typecheck
```

## Environment Variables

- `CODEGUIDE_API_URL`: API base URL (default: http://localhost:3000)
- `CODEGUIDE_API_KEY`: API key for authentication

## Project Structure

```
src/
├── core/           # Core package for programmatic usage
│   ├── types.ts    # TypeScript types
│   ├── api-service.ts # API service implementation
│   ├── codeguide.ts  # Main CodeGuide class
│   └── index.ts    # Core package exports
├── cli/            # CLI package
│   ├── commands.ts # CLI command definitions
│   └── index.ts    # CLI entry point
└── index.ts        # Main entry point
```