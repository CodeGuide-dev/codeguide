import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // You can add custom Vue components here if needed
    // Example:
    // app.component('CustomComponent', CustomComponent)
  },
} satisfies Theme

