# VitePress Setup Instructions

## The Issue

VitePress is an ESM-only package, but Node.js was trying to load it with CommonJS `require()`. This has been fixed by creating a separate `package.json` in the `docs/` directory with `"type": "module"`.

## Setup Steps

1. **Install dependencies in the docs directory**:
   ```bash
   cd packages/core
   npm run docs:install
   ```
   
   Or manually:
   ```bash
   cd packages/core/docs
   npm install
   ```

2. **Start the development server**:
   ```bash
   cd packages/core
   npm run docs:dev
   ```

3. **Open your browser**:
   Navigate to http://localhost:5173

## Available Commands

From `packages/core/`:
- `npm run docs:dev` - Start development server
- `npm run docs:build` - Build for production
- `npm run docs:preview` - Preview the built site
- `npm run docs:install` - Install docs dependencies

Or from `packages/core/docs/`:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview the built site

## Why Separate package.json?

The docs directory has its own `package.json` with `"type": "module"` to ensure VitePress (which is ESM-only) works correctly without affecting the main package's CommonJS setup.

