# CodeGuide Development Example

This example demonstrates how to use the codeguide-cli package in development mode.

## Setup

1. **Link the packages** (from the codeguide-cli directory):
```bash
npm run dev:link
```

2. **Link to this example project**:
```bash
cd example-project
npm link @codeguide/core
npm link @codeguide/cli
```

3. **Run the example**:
```bash
npm start
```

## Usage

### Programmatic Usage

```javascript
const { CodeGuide } = require('@codeguide/core');

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.app',
  databaseApiKey: 'sk_your_api_key'
});

// Get code guidance
const response = await codeguide.getGuidance('How to create a React component?');
console.log(response.response);

// Check API health
const isHealthy = await codeguide.isHealthy();
```

### CLI Usage

```bash
# Ask for code guidance
codeguide ask "How to create a React component?" --database-api-key sk_your_key

# Check API health
codeguide health --database-api-key sk_your_key

# Get help
codeguide --help
codeguide ask --help
codeguide health --help
```

## Authentication

Choose one of the following authentication methods:

1. **Database API Key** (highest priority):
   ```bash
   codeguide ask "your question" --database-api-key sk_your_key
   ```

2. **Legacy API Key + User ID**:
   ```bash
   codeguide ask "your question" --api-key your_key --user-id your_user_id
   ```

3. **JWT Token**:
   ```bash
   codeguide ask "your question" --jwt-token your_jwt_token
   ```

## Environment Variables

Copy `.env.example` to `.env` and configure your API credentials:

```bash
cp .env.example .env
```

## Development Workflow

1. **Make changes to codeguide-cli source code**
2. **Rebuild**: `cd ../ && npm run build`
3. **Relink**: `npm run dev:link`
4. **Changes are immediately available** in this example project

## Cleanup

To remove links and restore normal packages:

```bash
# In example project
npm unlink @codeguide/core
npm unlink @codeguide/cli

# In codeguide-cli directory
npm run dev:unlink
```