# Quick Start Guide

## Running the Documentation Locally

1. **Install dependencies** (if not already installed):
   ```bash
   cd packages/core
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run docs:dev
   ```

3. **Open your browser**:
   Navigate to http://localhost:5173

## Building for Production

```bash
npm run docs:build
```

The built files will be in `packages/core/docs/.vitepress/dist`

## Previewing the Build

```bash
npm run docs:preview
```

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress configuration (TypeScript)
│   ├── theme/
│   │   ├── index.ts       # Theme customization
│   │   └── custom.css     # Custom styles
│   └── tsconfig.json      # TypeScript config for VitePress
├── README.md              # Homepage
├── codeguide-client.md    # Client documentation
├── authentication.md      # Authentication docs
├── projects-service.md   # Projects service docs
├── codespace-service.md  # Codespace service docs
├── codespace-models.md   # Models documentation
├── security-keys-service.md # Security keys docs
└── usage-service.md      # Usage service docs
```

## Features

- ✅ TypeScript-based configuration
- ✅ Fast hot module replacement
- ✅ Built-in search
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ Edit links to GitHub

## Customization

### Changing Colors

Edit `docs/.vitepress/theme/custom.css` to customize the color scheme.

### Adding Pages

1. Create a new `.md` file in the `docs/` directory
2. Add it to the sidebar in `docs/.vitepress/config.ts`

### Custom Components

Add Vue components in `docs/.vitepress/theme/index.ts` in the `enhanceApp` function.

