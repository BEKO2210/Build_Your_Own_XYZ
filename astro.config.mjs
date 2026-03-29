import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  site: 'https://beko2210.github.io',
  base: '/Build_Your_Own_XYZ',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  },
  build: {
    format: 'directory'
  }
});
