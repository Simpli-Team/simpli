import type { SimpliUserConfig } from './src/core/config/types';

function defineConfig(config: SimpliUserConfig): SimpliUserConfig {
  return config;
}

export default defineConfig({
  title: 'Simpli Documentation',
  tagline: 'Lightweight, blazing-fast documentation framework',
  url: 'https://simpli-docs.vercel.app',
  baseUrl: '/',

  themeConfig: {
    navbar: {
      title: 'Simpli',
      logo: {
        src: '/logo.svg',
        alt: 'Simpli Logo',
      },
      items: [
        { label: 'Docs', to: '/docs', position: 'left' },
        { label: 'Blog', to: '/blog', position: 'left' },
        { type: 'search', position: 'right' },
        { type: 'themeToggle', position: 'right' },
      ],
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    search: {
      enabled: true,
      provider: 'local',
    },
    footer: {
      style: 'dark',
      logo: {
        src: '/logo.svg',
        alt: 'Simpli Logo',
      },
      copyright: `Copyright © ${new Date().getFullYear()} Simpli. Built with ❤️`,
    },
  },
});
