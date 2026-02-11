---
name: Simpli Documentation Framework
description: |
  A lightweight, blazing-fast, feature-rich documentation framework built with
  React 19, TypeScript 5.9, Tailwind CSS 4, and Vite 7. Designed to be superior
  to Docusaurus with modern architecture, smaller bundle size, and easier configuration.
---

# 🚀 Simpli Documentation Framework

## Overview

**Simpli** คือ Documentation Framework รุ่นใหม่ที่ออกแบบมาเพื่อแทนที่ Docusaurus ด้วยสถาปัตยกรรมที่ทันสมัยกว่า เบากว่า เร็วกว่า และใช้งานง่ายกว่า

### 🎯 Design Goals
- **Ultra-Lightweight**: Bundle size < 50KB gzipped (vs Docusaurus ~200KB+)
- **Blazing Fast**: < 100ms cold start, < 10ms HMR
- **Zero-Config**: ใช้งานได้ทันทีด้วย convention-over-configuration
- **Feature-Rich**: ฟีเจอร์เทียบเท่า Docusaurus แต่ architecture ดีกว่า
- **Type-Safe**: TypeScript-first ทุก API มี full type inference
- **Plugin-First**: ทุกฟีเจอร์เป็น plugin รวมถึง core features

---

## 📦 Technology Stack & Versions

| Library | Version | Purpose |
|---------|---------|---------|
| **React** | `^19.2.0` | UI Runtime with React Compiler |
| **TypeScript** | `~5.9.3` | Type System |
| **Vite** | `^7.3.1` | Build Tool & Dev Server |
| **Tailwind CSS** | `^4.1.18` | Utility-First CSS (CSS-first config) |
| **React Router** | `^7.13.0` | Client-Side Routing |
| **MDX** | `^3.1.1` | Markdown + JSX |
| **@mdx-js/react** | `^3.1.1` | MDX React Provider |
| **@mdx-js/rollup** | `^3.1.1` | MDX Vite/Rollup Integration |
| **Shiki** | `^3.22.0` | Syntax Highlighting (VS Code quality) |
| **Zustand** | `^5.0.11` | Lightweight State Management |
| **FlexSearch** | `^0.8.212` | Full-Text Search (client-side) |
| **remark-gfm** | `^4.0.0` | GitHub Flavored Markdown |
| **remark-directive** | `^4.0.0` | Custom Directives (admonitions) |
| **rehype-slug** | `^6.0.0` | Auto heading IDs |
| **rehype-autolink-headings** | `^7.1.0` | Heading anchor links |
| **gray-matter** | `^4.0.3` | Frontmatter parsing |
| **@vitejs/plugin-react** | `^5.1.1` | React + React Compiler |
| **babel-plugin-react-compiler** | `^1.0.0` | Auto memoization |
| **@tailwindcss/vite** | `^4.1.18` | Tailwind Vite Plugin |
| **lucide-react** | `^0.475.0` | Icon library |
| **clsx** | `^2.1.1` | Class merging utility |
| **motion** | `^12.0.0` | Animation library (framer-motion v12) |

---

## 🏗️ Architecture Overview

ดูรายละเอียดเพิ่มเติมที่:
- [Architecture Details](./docs/01-architecture.md)
- [Plugin System](./docs/02-plugin-system.md)
- [Content Pipeline](./docs/03-content-pipeline.md)
- [UI Components](./docs/04-ui-components.md)
- [Configuration](./docs/05-configuration.md)
- [Implementation Phases](./docs/06-phases.md)

### High-Level Architecture (Layered)

```
┌─────────────────────────────────────────────────┐
│                  User Content                    │
│         (MDX/MD files, simpli.config.ts)         │
├─────────────────────────────────────────────────┤
│              Plugin Layer (Hooks)                │
│    content · theme · search · analytics · i18n   │
├─────────────────────────────────────────────────┤
│              Core Engine                         │
│   Router │ MDX Pipeline │ Config │ State (Zustand)│
├─────────────────────────────────────────────────┤
│              Build Layer                         │
│     Vite 7 │ Rollup │ React Compiler │ Tailwind  │
├─────────────────────────────────────────────────┤
│              Runtime Layer                       │
│     React 19 │ Suspense │ Transitions │ RSC-ready │
└─────────────────────────────────────────────────┘
```

### Key Architecture Principles

1. **Island Architecture**: Interactive components only hydrate when needed
2. **Streaming SSG**: Pre-render pages at build time with streaming
3. **Virtual Module System**: Config & content exposed via Vite virtual modules
4. **Hook-Based Plugins**: WordPress-style hooks for extensibility
5. **Convention-over-Configuration**: Smart defaults, override when needed

---

## 📁 Project Structure

```
simpli-framework/
├── .agent/skills/simpli-framework/    # This skill
│   ├── SKILL.md                       # Main instruction file
│   └── docs/                          # Detailed documentation
├── src/
│   ├── cli/                           # CLI tool (npx simpli)
│   │   ├── index.ts                   # CLI entry
│   │   ├── commands/                  # create, dev, build, serve
│   │   └── templates/                 # Scaffolding templates
│   ├── core/                          # Core engine
│   │   ├── config/                    # Config loader & types
│   │   │   ├── defaults.ts            # Default configuration
│   │   │   ├── loader.ts              # Config file loader
│   │   │   └── types.ts              # Config TypeScript types
│   │   ├── router/                    # Radix-tree based router
│   │   │   ├── RadixRouter.ts         # Radix tree implementation
│   │   │   ├── RouteGenerator.ts      # Auto route from file system
│   │   │   └── types.ts              # Route types
│   │   ├── content/                   # Content pipeline
│   │   │   ├── ContentLoader.ts       # File system content loader
│   │   │   ├── MDXProcessor.ts        # MDX compilation pipeline
│   │   │   ├── FrontmatterParser.ts   # Gray-matter wrapper
│   │   │   └── ContentIndex.ts        # Search index builder
│   │   ├── plugin/                    # Plugin system
│   │   │   ├── PluginManager.ts       # Plugin lifecycle management
│   │   │   ├── hooks.ts              # Hook registry (tap/call)
│   │   │   └── types.ts              # Plugin API types
│   │   ├── state/                     # Global state (Zustand)
│   │   │   ├── store.ts              # Main store
│   │   │   ├── slices/               # State slices
│   │   │   └── selectors.ts          # Memoized selectors
│   │   └── vite/                      # Vite plugin
│   │       ├── plugin.ts             # Main Vite plugin
│   │       ├── virtualModules.ts     # Virtual module provider
│   │       └── mdxTransform.ts       # MDX transform pipeline
│   ├── theme/                         # Default theme
│   │   ├── components/               # UI components
│   │   │   ├── Layout/               # Layout shell
│   │   │   ├── Navbar/               # Navigation bar
│   │   │   ├── Sidebar/              # Sidebar navigation
│   │   │   ├── DocPage/              # Doc page wrapper
│   │   │   ├── BlogPage/             # Blog layout
│   │   │   ├── TOC/                  # Table of contents
│   │   │   ├── SearchModal/          # Search dialog (⌘K)
│   │   │   ├── CodeBlock/            # Shiki code highlighting
│   │   │   ├── Admonition/           # Info/Warning/Tip boxes
│   │   │   ├── Tabs/                 # Tabbed content
│   │   │   ├── MDXComponents/        # MDX component mapping
│   │   │   ├── Footer/               # Site footer
│   │   │   ├── ThemeToggle/          # Dark/Light mode
│   │   │   ├── VersionDropdown/      # Version selector
│   │   │   ├── Pagination/           # Prev/Next navigation
│   │   │   ├── Breadcrumb/           # Breadcrumb navigation
│   │   │   ├── CopyButton/          # Code copy button
│   │   │   ├── Mermaid/             # Diagram support
│   │   │   ├── APITable/            # API reference table
│   │   │   ├── Details/             # Collapsible content
│   │   │   ├── Card/                # Doc cards
│   │   │   ├── Badge/               # Status badges
│   │   │   └── ExportPDF/           # PDF export
│   │   ├── styles/                   # Theme styles
│   │   │   ├── index.css            # Main entry (Tailwind import)
│   │   │   ├── theme.css            # CSS custom properties
│   │   │   ├── prose.css            # Typography for content
│   │   │   └── animations.css       # Micro-animations
│   │   └── hooks/                    # Theme hooks
│   │       ├── useTheme.ts          # Dark/light mode
│   │       ├── useToc.ts            # Table of contents
│   │       ├── useSidebar.ts        # Sidebar state
│   │       ├── useSearch.ts         # Search integration
│   │       ├── useScrollSpy.ts      # Active heading tracking
│   │       └── useMediaQuery.ts     # Responsive breakpoints
│   ├── plugins/                      # Built-in plugins
│   │   ├── content-docs/            # Documentation plugin
│   │   ├── content-blog/            # Blog plugin
│   │   ├── content-pages/           # Custom pages plugin
│   │   ├── search-local/            # FlexSearch local search
│   │   ├── sitemap/                 # Sitemap generator
│   │   ├── analytics/               # Analytics integration
│   │   ├── i18n/                    # Internationalization
│   │   ├── pwa/                     # Progressive Web App
│   │   └── openapi/                 # OpenAPI/Swagger docs
│   ├── App.tsx                       # Root app component
│   ├── main.tsx                      # Entry point
│   └── types/                        # Global type definitions
├── docs/                             # Example documentation
├── blog/                             # Example blog posts
├── simpli.config.ts                  # User configuration
├── index.html                        # HTML entry
├── tailwind.config.ts                # Tailwind configuration (optional)
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

---

## ⚡ Quick Start Config

### `simpli.config.ts` (Zero-Config Friendly)

```typescript
import { defineConfig } from '@simpli/core';

export default defineConfig({
  title: 'My Docs',
  tagline: 'Documentation made simple',
  url: 'https://mydocs.dev',

  // Everything below is optional with smart defaults
  themeConfig: {
    navbar: {
      title: 'My Docs',
      logo: { src: '/logo.svg' },
      items: [
        { label: 'Docs', to: '/docs' },
        { label: 'Blog', to: '/blog' },
        { label: 'GitHub', href: 'https://github.com/...' },
      ],
    },
    footer: { style: 'dark' },
    colorMode: { defaultMode: 'auto', respectPrefersColorScheme: true },
    search: { enabled: true }, // FlexSearch auto-configured
  },
  
  plugins: [
    // Built-in plugins auto-loaded by convention
    // Add custom plugins here
  ],
});
```

---

## 🔑 Key Differentiators vs Docusaurus

| Feature | Docusaurus | Simpli |
|---------|-----------|--------|
| Build Tool | Webpack | Vite 7 (100x faster HMR) |
| React | v18 | v19 + React Compiler |
| CSS | CSS Modules/Infima | Tailwind CSS 4 (CSS-first) |
| Bundle Size | ~200KB+ gzip | Target < 50KB gzip |
| Cold Start | ~3-5s | < 100ms |
| Config | JS/TS verbose | TypeScript with full inference |
| Syntax Highlight | Prism | Shiki (VS Code quality) |
| Search | Algolia (external) | FlexSearch (built-in, offline) |
| State | React Context | Zustand (no re-render cascade) |
| Routing | React Router v5 | Radix Tree + React Router v7 |
| Animation | None | Motion (framer-motion v12) |
| Plugin System | Lifecycle-based | Hook-based (simpler, composable) |

---

## 📋 Implementation Phases

ดูรายละเอียดแต่ละ Phase ที่ [Implementation Phases](./docs/06-phases.md)

### Phase 1: Foundation (Core Engine) ⏱️ ~3-4 days
- Project setup, dependencies, Vite config
- Config system with `defineConfig`
- Virtual module system
- Radix-tree router + file-based routing
- MDX pipeline (remark/rehype)

### Phase 2: Theme & Components ⏱️ ~3-4 days
- Layout shell (Navbar, Sidebar, Footer)
- MDX component mapping
- CodeBlock with Shiki
- Admonitions, Tabs, Details
- Dark/Light theme with Tailwind CSS 4
- TOC with scroll spy
- Responsive design

### Phase 3: Plugin System ⏱️ ~2-3 days
- Plugin manager & hook system
- content-docs plugin
- content-blog plugin
- search-local plugin (FlexSearch)
- sitemap plugin

### Phase 4: Advanced Features ⏱️ ~2-3 days
- Versioning system
- i18n plugin
- Mermaid diagrams
- API reference tables
- PDF export
- PWA support
- Analytics plugin

### Phase 5: CLI & DX ⏱️ ~2 days
- `npx simpli create` scaffolding
- `simpli dev` / `simpli build` / `simpli serve`
- Error overlay improvements
- Performance profiling

### Phase 6: Optimization & Polish ⏱️ ~2 days
- Tree-shaking & code splitting
- Image optimization
- Prefetching strategies
- Lighthouse 100 score
- Bundle analysis & reduction
- Documentation for Simpli itself

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 📚 Further Reading

- [Architecture Details](./docs/01-architecture.md) - Deep dive into system architecture
- [Plugin System](./docs/02-plugin-system.md) - How plugins work
- [Content Pipeline](./docs/03-content-pipeline.md) - MDX processing flow
- [UI Components](./docs/04-ui-components.md) - Component specifications
- [Configuration](./docs/05-configuration.md) - Full config reference
- [Implementation Phases](./docs/06-phases.md) - Step-by-step build plan
