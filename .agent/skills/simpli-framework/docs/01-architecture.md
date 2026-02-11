# 🏗️ Architecture Details

## Design Philosophy

Simpli ใช้สถาปัตยกรรมแบบ **Modular Layered Architecture** ที่แยก concerns ออกจากกันชัดเจน
แต่ละ layer สามารถเปลี่ยนแปลงได้โดยไม่กระทบ layer อื่น

## Layer Diagram

```
┌──────────────────────────────────────────────────────────┐
│  Presentation Layer (React 19 + Tailwind CSS 4)          │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌─────┐ ┌──────────────┐ │
│  │Navbar│ │Sidebar │ │DocPage│ │ TOC │ │ SearchModal  │ │
│  └──────┘ └────────┘ └───────┘ └─────┘ └──────────────┘ │
├──────────────────────────────────────────────────────────┤
│  State Layer (Zustand 5)                                 │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │ThemeSlice│ │SidebarSl │ │SearchSl│ │  ConfigSlice  │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Plugin Layer (Hook-Based)                               │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────────┐ │
│  │content-docs│ │content-blog│ │  search-local (Flex)  │ │
│  │   plugin   │ │   plugin   │ │      plugin           │ │
│  └────────────┘ └────────────┘ └───────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  Core Engine                                             │
│  ┌──────────┐ ┌────────────┐ ┌──────┐ ┌──────────────┐  │
│  │  Config  │ │RadixRouter │ │ MDX  │ │PluginManager │  │
│  │  Loader  │ │+ FileRoute │ │Pipe  │ │  + Hooks     │  │
│  └──────────┘ └────────────┘ └──────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Build Layer (Vite 7 + Rollup)                           │
│  ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │
│  │ simpli-vite   │ │ Virtual Mods  │ │ MDX Transform  │  │
│  │   plugin      │ │ (config/meta) │ │  (remark/rehype)│ │
│  └───────────────┘ └───────────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 1. Virtual Module System

หัวใจของ Simpli คือ **Virtual Modules** ที่ Vite สร้างขึ้นตอน dev/build:

```typescript
// Virtual modules ที่ Simpli สร้าง:
// 'virtual:simpli/config'     → Site config object
// 'virtual:simpli/routes'     → Generated route tree
// 'virtual:simpli/sidebar'    → Sidebar navigation data
// 'virtual:simpli/search'     → Search index data
// 'virtual:simpli/metadata'   → All docs metadata
// 'virtual:simpli/versions'   → Version info

// Usage in components:
import siteConfig from 'virtual:simpli/config';
import { routes } from 'virtual:simpli/routes';
```

### Implementation

```typescript
// src/core/vite/virtualModules.ts
const VIRTUAL_MODULES = {
  'virtual:simpli/config': () => generateConfigModule(config),
  'virtual:simpli/routes': () => generateRoutesModule(contentDir),
  'virtual:simpli/sidebar': () => generateSidebarModule(sidebarConfig),
  'virtual:simpli/search': () => generateSearchIndex(docs),
} as const;

export function resolveVirtualModule(id: string): string | null {
  const generator = VIRTUAL_MODULES[id];
  return generator ? generator() : null;
}
```

## 2. Radix Tree Router

แทนที่จะใช้ linear matching แบบ React Router ทั่วไป Simpli ใช้ **Radix Tree**
สำหรับ O(k) route matching (k = path length) แทน O(n) (n = number of routes):

```typescript
// src/core/router/RadixRouter.ts
interface RadixNode<T> {
  segment: string;
  data?: T;
  children: Map<string, RadixNode<T>>;
  paramName?: string;    // :slug dynamic params
  isWildcard?: boolean;  // ** catch-all
}

class RadixRouter<T> {
  private root: RadixNode<T>;
  
  insert(path: string, data: T): void { /* ... */ }
  match(path: string): { data: T; params: Record<string, string> } | null { /* ... */ }
  
  // File-system based auto route generation
  static fromDirectory(dir: string): RadixRouter<RouteData> { /* ... */ }
}
```

### File-Based Routing Convention

```
docs/
├── index.mdx          → /docs
├── getting-started.mdx → /docs/getting-started
├── guides/
│   ├── index.mdx      → /docs/guides  
│   ├── installation.mdx → /docs/guides/installation
│   └── [slug].mdx     → /docs/guides/:slug (dynamic)
└── api/
    └── [...path].mdx  → /docs/api/* (catch-all)
```

## 3. State Management (Zustand 5)

ใช้ Zustand แทน React Context เพื่อหลีกเลี่ยง re-render cascade:

```typescript
// src/core/state/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimpliStore {
  // Theme
  colorMode: 'light' | 'dark' | 'auto';
  setColorMode: (mode: 'light' | 'dark' | 'auto') => void;
  
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Search
  searchOpen: boolean;
  searchQuery: string;
  
  // Active doc
  activeDocId: string | null;
  tocActiveId: string | null;
}
```

## 4. MDX Pipeline

```
MDX File → gray-matter (frontmatter)
         → remark-gfm (tables, strikethrough)
         → remark-directive (admonitions)  
         → remark-math (optional)
         → @mdx-js/rollup (compile to JSX)
         → rehype-slug (heading IDs)
         → rehype-autolink-headings (anchor links)
         → Shiki (syntax highlighting)
         → React Component
```

## 5. Build Optimization Strategy

```typescript
// Code splitting strategy:
// 1. Route-based: Each page is a lazy chunk
// 2. Component-based: Heavy components (Mermaid, Shiki) loaded on demand
// 3. Vendor: React + React-DOM in separate chunk
// 4. Theme: All theme CSS in single optimized chunk

// vite.config.ts optimization
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router': ['react-router'],
        'mdx': ['@mdx-js/react'],
        'search': ['flexsearch'],
        'highlight': ['shiki'],
      }
    }
  },
  target: 'es2022',      // Modern browsers only
  cssMinify: 'lightningcss',
  minify: 'terser',
}
```

## 6. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| FCP | < 0.8s | SSG + inline critical CSS |
| LCP | < 1.2s | Preload fonts, optimize images |
| TTI | < 1.5s | Code splitting, lazy hydration |
| CLS | 0 | Fixed layout dimensions |
| Bundle (JS) | < 50KB gzip | Tree-shaking, React Compiler |
| Bundle (CSS) | < 10KB gzip | Tailwind purge + minify |
| Dev HMR | < 10ms | Vite 7 native ESM |
| Build Time | < 5s (100 pages) | Parallel MDX processing |
