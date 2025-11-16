# VitePress Documentation Setup

This directory contains the VitePress configuration for the @codeguide/core documentation.

## Structure

- `config.ts` - Main VitePress configuration file (TypeScript)
- `theme/` - Custom theme files
  - `index.ts` - Theme entry point
  - `custom.css` - Custom styles

## Development

To run the documentation locally:

```bash
cd packages/core
npm install
npm run docs:dev
```

Then open http://localhost:5173

## Building

To build the documentation for production:

```bash
npm run docs:build
```

The output will be in `packages/core/docs/.vitepress/dist`

## Preview

To preview the built documentation:

```bash
npm run docs:preview
```

## Configuration

The main configuration is in `config.ts`. Key features:

- TypeScript-based configuration
- Sidebar navigation
- Search functionality
- Edit links to GitHub
- Custom theme styling

