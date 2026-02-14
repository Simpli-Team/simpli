import { defineConfig } from 'simpli-docs';

export default defineConfig({
  title: '{{projectName}}',
  tagline: 'Documentation made simple',
  url: 'https://example.com',
  baseUrl: '/',
  
  themeConfig: {
    font: {
      family: 'inter',
    },
    navbar: {
      title: '{{projectName}}',
      items: [
        { label: 'Docs', to: '/docs', position: 'left' },
        { type: 'search', position: 'right' },
        { type: 'themeToggle', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} {{projectName}}. Built with Simpli.`,
    },
    search: {
      enabled: true,
      provider: 'local',
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  },
});
