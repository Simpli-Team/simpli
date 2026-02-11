# ⚙️ Configuration Reference

## `simpli.config.ts` Full Schema

```typescript
import { defineConfig } from '@simpli/core';

export default defineConfig({
  // ═══════════════════════════════════════
  // SITE METADATA (Required)
  // ═══════════════════════════════════════
  title: 'My Documentation',
  tagline: 'Build amazing docs with Simpli',
  url: 'https://docs.example.com',
  baseUrl: '/',                        // Default: '/'
  favicon: '/favicon.ico',             // Default: '/favicon.ico'
  
  // ═══════════════════════════════════════
  // ORGANIZATION
  // ═══════════════════════════════════════
  organizationName: 'my-org',          // GitHub org
  projectName: 'my-project',          // GitHub repo
  
  // ═══════════════════════════════════════
  // CONTENT DIRECTORIES
  // ═══════════════════════════════════════
  docsDir: 'docs',                     // Default: 'docs'
  blogDir: 'blog',                     // Default: 'blog'
  pagesDir: 'src/pages',              // Default: 'src/pages'
  staticDir: 'static',                // Default: 'static'
  
  // ═══════════════════════════════════════
  // INTERNATIONALIZATION
  // ═══════════════════════════════════════
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'th', 'ja'],
    localeConfigs: {
      en: { label: 'English', direction: 'ltr' },
      th: { label: 'ไทย', direction: 'ltr' },
    },
  },
  
  // ═══════════════════════════════════════
  // THEME CONFIGURATION
  // ═══════════════════════════════════════
  themeConfig: {
    // --- Navbar ---
    navbar: {
      title: 'Simpli',
      logo: {
        alt: 'Simpli Logo',
        src: '/img/logo.svg',
        srcDark: '/img/logo-dark.svg',  // Optional dark mode logo
        width: 32,
        height: 32,
      },
      items: [
        { type: 'doc', docId: 'intro', label: 'Docs', position: 'left' },
        { type: 'link', to: '/blog', label: 'Blog', position: 'left' },
        {
          type: 'dropdown',
          label: 'Community',
          position: 'left',
          items: [
            { label: 'Discord', href: 'https://discord.gg/...' },
            { label: 'GitHub', href: 'https://github.com/...' },
          ],
        },
        { type: 'search', position: 'right' },
        { type: 'localeDropdown', position: 'right' },
        { type: 'themeToggle', position: 'right' },
        {
          type: 'link',
          href: 'https://github.com/org/repo',
          position: 'right',
          icon: 'github',              // Lucide icon name
        },
      ],
      hideOnScroll: false,
      style: 'dark',                   // 'primary' | 'dark'
    },
    
    // --- Sidebar ---
    sidebar: {
      hideable: true,                  // Allow user to collapse
      autoCollapseCategories: true,    // Collapse other categories on expand
    },
    
    // --- Footer ---
    footer: {
      style: 'dark',                   // 'light' | 'dark'
      logo: { src: '/img/logo.svg', alt: 'Simpli' },
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/docs/intro' },
            { label: 'API Reference', to: '/docs/api' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discord', href: 'https://discord.gg/...' },
            { label: 'Twitter', href: 'https://twitter.com/...' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project.`,
    },
    
    // --- Color Mode ---
    colorMode: {
      defaultMode: 'light',           // 'light' | 'dark'
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    // --- Table of Contents ---
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    
    // --- Search ---
    search: {
      enabled: true,
      provider: 'local',              // 'local' (FlexSearch) | 'algolia'
      algolia: {                       // Only if provider: 'algolia'
        appId: '',
        apiKey: '',
        indexName: '',
      },
      // Local search options
      local: {
        indexDocs: true,
        indexBlog: true,
        indexPages: false,
        highlightSearchTerms: true,
        maxResults: 10,
      },
    },
    
    // --- Code Block ---
    codeBlock: {
      showLineNumbers: false,          // Default off, enable per block
      theme: {
        light: 'github-light',        // Shiki theme for light mode
        dark: 'github-dark',          // Shiki theme for dark mode
      },
      magicComments: [                 // Custom highlight markers
        { className: 'code-highlight', line: 'highlight-next-line' },
        { className: 'code-error', line: 'error-line' },
      ],
    },
    
    // --- Announcement Bar ---
    announcementBar: {
      id: 'announcement-1',
      content: '⭐ Star us on GitHub!',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      isCloseable: true,
    },
    
    // --- Metadata ---
    metadata: [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'og:type', content: 'website' },
    ],
    
    // --- Custom CSS Variables ---
    customCss: {
      '--simpli-primary': '#4f46e5',
      '--simpli-primary-dark': '#6366f1',
      '--simpli-font-family': "'Inter', sans-serif",
      '--simpli-radius': '0.5rem',
    },
  },

  // ═══════════════════════════════════════
  // MARKDOWN OPTIONS  
  // ═══════════════════════════════════════
  markdown: {
    format: 'mdx',                     // 'mdx' | 'md' | 'detect'
    remarkPlugins: [],                 // Additional remark plugins
    rehypePlugins: [],                 // Additional rehype plugins
    mermaid: true,                     // Enable Mermaid diagrams
    math: false,                       // Enable KaTeX math
  },

  // ═══════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════
  plugins: [
    // Built-in plugins are auto-loaded
    // Add custom or third-party plugins:
    // ['@simpli/plugin-analytics', { trackingId: 'G-...' }],
    // ['@simpli/plugin-pwa', { offlineMode: true }],
    // myCustomPlugin({ option: true }),
  ],

  // ═══════════════════════════════════════
  // SIDEBARS (manual override)
  // ═══════════════════════════════════════
  sidebars: {
    docs: [
      'intro',
      {
        type: 'category',
        label: 'Getting Started',
        collapsed: false,
        items: ['installation', 'configuration'],
      },
      {
        type: 'category', 
        label: 'Guides',
        items: [{ type: 'autogenerated', dirName: 'guides' }],
      },
    ],
  },

  // ═══════════════════════════════════════
  // VERSIONING
  // ═══════════════════════════════════════
  versioning: {
    enabled: false,
    versions: {
      current: { label: 'Next', path: 'next' },
    },
    lastVersion: '2.0.0',
  },

  // ═══════════════════════════════════════
  // BUILD OPTIONS
  // ═══════════════════════════════════════
  build: {
    outDir: 'build',                   // Output directory
    trailingSlash: false,              // URL trailing slashes
    noIndex: false,                    // Disable search engine indexing
  },
});
```

## `defineConfig` Helper

```typescript
// Provides full TypeScript autocompletion and validation
import type { SimpliConfig } from '@simpli/core';

export function defineConfig(config: SimpliConfig): SimpliConfig {
  return mergeWithDefaults(config);
}
```

## Environment Variables

```bash
# .env
SIMPLI_URL=https://docs.example.com
SIMPLI_BASE_URL=/
SIMPLI_LOCALE=en
SIMPLI_GA_TRACKING_ID=G-XXXXXXXXXX
```

All `SIMPLI_*` env vars are auto-available via `import.meta.env`.
