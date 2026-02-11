# 🔌 Plugin System

## Design Philosophy

Simpli Plugin System ใช้แนวคิด **Hook-Based Architecture** คล้าย WordPress/Webpack
Tapable แต่ออกแบบให้เรียบง่ายกว่า ทุกฟีเจอร์รวมถึง core features ก็เป็น plugin

## Plugin Interface

```typescript
// src/core/plugin/types.ts
export interface SimpliPlugin {
  name: string;
  version?: string;
  
  // Lifecycle hooks
  configLoaded?(config: SimpliConfig): SimpliConfig | void;
  contentLoaded?(args: ContentLoadedArgs): void | Promise<void>;
  routesResolved?(routes: RouteConfig[]): RouteConfig[];
  postBuild?(args: PostBuildArgs): void | Promise<void>;
  
  // Theme hooks
  getThemeComponents?(): Record<string, React.ComponentType>;
  getClientModules?(): string[];
  
  // Content hooks
  extendMarkdown?(md: MarkdownOptions): MarkdownOptions;
  transformContent?(content: string, filePath: string): string;
  
  // Config hooks
  extendViteConfig?(config: ViteUserConfig): ViteUserConfig;
}
```

## Plugin Manager

```typescript
// src/core/plugin/PluginManager.ts
class PluginManager {
  private plugins: SimpliPlugin[] = [];
  private hooks: HookRegistry;
  
  register(plugin: SimpliPlugin): void;
  
  // Execute hooks in order
  async callHook<K extends keyof SimpliPlugin>(
    hookName: K, 
    ...args: Parameters<NonNullable<SimpliPlugin[K]>>
  ): Promise<void>;
  
  // Waterfall: each plugin transforms the value
  async waterfallHook<T>(hookName: string, initial: T): Promise<T>;
}
```

## Hook System

```typescript
// src/core/plugin/hooks.ts
type HookType = 'sync' | 'async' | 'waterfall' | 'bail';

interface Hook<T = any> {
  type: HookType;
  callbacks: Array<{
    pluginName: string;
    fn: (...args: any[]) => T;
    priority: number;
  }>;
}

class HookRegistry {
  private hooks = new Map<string, Hook>();
  
  // Register a hook handler
  tap(hookName: string, pluginName: string, fn: Function, priority?: number): void;
  
  // Call all handlers
  call(hookName: string, ...args: any[]): any;
  callAsync(hookName: string, ...args: any[]): Promise<any>;
  waterfall(hookName: string, initial: any, ...args: any[]): any;
}
```

## Available Hooks (Lifecycle Order)

### Build-Time Hooks
| Hook | Type | Description |
|------|------|-------------|
| `config:loaded` | waterfall | Modify config after loading |
| `config:resolved` | sync | Config finalized, read-only |
| `content:discovered` | async | Content files found |
| `content:transform` | waterfall | Transform MDX before compile |
| `content:loaded` | async | All content compiled |
| `routes:generated` | waterfall | Modify auto-generated routes |
| `routes:resolved` | sync | Routes finalized |
| `search:index` | waterfall | Modify search index data |
| `sidebar:generated` | waterfall | Modify sidebar structure |
| `build:start` | async | Build process starting |
| `build:end` | async | Build completed |

### Runtime Hooks
| Hook | Type | Description |
|------|------|-------------|
| `app:init` | async | App initializing |
| `page:enter` | sync | Page navigation started |
| `page:loaded` | sync | Page content rendered |
| `theme:changed` | sync | Color mode switched |

## Built-in Plugins

### 1. `content-docs` - Documentation Plugin
```typescript
// Handles: docs/ directory, sidebar generation, versioning
{
  name: '@simpli/plugin-content-docs',
  contentLoaded({ content, addRoute }) {
    for (const doc of content.docs) {
      addRoute({
        path: doc.permalink,
        component: '@theme/DocPage',
        metadata: doc.metadata,
      });
    }
  },
  sidebarGenerated(sidebar) {
    return autogenerateSidebar(sidebar, content.docs);
  }
}
```

### 2. `content-blog` - Blog Plugin
```typescript
{
  name: '@simpli/plugin-content-blog',
  // Blog listing, pagination, tags, RSS feed
}
```

### 3. `search-local` - FlexSearch Integration
```typescript
{
  name: '@simpli/plugin-search-local',
  contentLoaded({ content }) {
    // Build FlexSearch index from all docs
    const index = new FlexSearch.Document({
      document: { id: 'id', index: ['title', 'content', 'tags'] },
      tokenize: 'forward',
      resolution: 9,
    });
    content.docs.forEach(doc => index.add(doc));
  },
  getClientModules() {
    return ['./SearchProvider.tsx'];
  }
}
```

### 4. `sitemap` - Sitemap Generator
### 5. `analytics` - Google/Plausible Analytics
### 6. `i18n` - Internationalization
### 7. `pwa` - Progressive Web App
### 8. `openapi` - OpenAPI/Swagger Documentation

## Custom Plugin Example

```typescript
// my-plugin.ts
import type { SimpliPlugin } from '@simpli/core';

export default function myPlugin(options = {}): SimpliPlugin {
  return {
    name: 'my-custom-plugin',
    
    configLoaded(config) {
      // Modify config
      return { ...config, customData: options };
    },
    
    async contentLoaded({ content, addRoute }) {
      // Add custom pages
      addRoute({
        path: '/custom',
        component: './CustomPage.tsx',
      });
    },
    
    extendMarkdown(md) {
      // Add custom remark/rehype plugins
      return {
        ...md,
        remarkPlugins: [...md.remarkPlugins, myRemarkPlugin],
      };
    },
  };
}

// Usage in simpli.config.ts:
import myPlugin from './my-plugin';
export default defineConfig({
  plugins: [myPlugin({ option: true })],
});
```
