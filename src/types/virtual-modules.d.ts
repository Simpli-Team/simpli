// ============================================================================
// Simpli Framework - Virtual Module Type Declarations
// ============================================================================
// Type definitions for Vite virtual modules provided by Simpli.
// These modules are generated at build time and don't exist on disk.
// ============================================================================

declare module 'virtual:simpli/config' {
  import type { SimpliConfig } from '../core/config/types';
  const config: SimpliConfig;
  export default config;
  export const { title, tagline, url, baseUrl, themeConfig, i18n, customFields }: SimpliConfig;
}

declare module 'virtual:simpli/routes' {
  export interface Route {
    path: string;
    component: () => Promise<unknown>;
    metadata?: Record<string, unknown>;
  }
  export const routes: Route[];
  export default routes;
}

declare module 'virtual:simpli/sidebar' {
  import type { SidebarItem } from '../core/config/types';
  const sidebar: Record<string, SidebarItem[]>;
  export default sidebar;
}

declare module 'virtual:simpli/search-index' {
  export interface SearchDocument {
    id: string;
    title: string;
    content: string;
    path: string;
    headings: string[];
    tags: string[];
    section: string;
  }
  const searchIndex: SearchDocument[];
  export default searchIndex;
}

declare module 'virtual:simpli/metadata' {
  export interface DocMetadata {
    title: string;
    description?: string;
    path: string;
    tags?: string[];
    lastUpdate?: string;
  }
  const metadata: Record<string, DocMetadata>;
  export default metadata;
  export function getDocMeta(id: string): DocMetadata | undefined;
}

declare module 'virtual:simpli/versions' {
  export const versions: Record<string, {
    label: string;
    path?: string;
    banner?: 'none' | 'unreleased' | 'unmaintained';
    badge?: boolean;
  }>;
  export const lastVersion: string | undefined;
  export const isVersioningEnabled: boolean;
}
