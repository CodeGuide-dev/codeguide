import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@codeguide/core',
  description: 'Documentation for @codeguide/core package - TypeScript SDK for CodeGuide API',
  
  // Server configuration
  server: {
    port: 5174,
    host: true,
  },
  
  // Base URL if deploying to a subdirectory
  base: '/',
  
  // Theme configuration
  themeConfig: {
    // Logo (optional)
    logo: '/logo.png', // You can add a logo later
    
    // Site title in nav
    siteTitle: '@codeguide/core',
    
    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/codeguide-client' },
      { text: 'Services', link: '/projects-service' },
      { text: 'GitHub', link: 'https://github.com/CodeGuide-dev/codeguide' },
    ],
    
    // Sidebar navigation
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'CodeGuide Client', link: '/codeguide-client' },
          { text: 'Authentication', link: '/authentication' },
        ],
      },
      {
        text: 'Services',
        items: [
          { text: 'Projects Service', link: '/projects-service' },
          { text: 'Codespace Service', link: '/codespace-service' },
          { text: 'Codespace Models', link: '/codespace-models' },
          { text: 'Security Keys Service', link: '/security-keys-service' },
          { text: 'Usage Service', link: '/usage-service' },
        ],
      },
    ],
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CodeGuide-dev/codeguide' },
    ],
    
    // Search configuration
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search documentation',
              },
              modal: {
                noResultsText: 'No results for',
                resetButtonTitle: 'Reset search',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close',
                },
              },
            },
          },
        },
      },
    },
    
    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 CodeGuide Team',
    },
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/CodeGuide-dev/codeguide/blob/main/packages/core/docs/:path',
      text: 'Edit this page on GitHub',
    },
    
    // Carbon ads (optional - remove if not needed)
    // carbonAds: {
    //   code: 'your-code',
    //   placement: 'your-placement'
    // },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
    },
    
    // Outline configuration
    outline: {
      level: [2, 3],
      label: 'On this page',
    },
    
    // Doc footer (prev/next links)
    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },
  },
  
  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    // Disable Vue component parsing in markdown to avoid conflicts
    breaks: false,
  },
  
  // Head configuration
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'description', content: 'Documentation for @codeguide/core package' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
})

