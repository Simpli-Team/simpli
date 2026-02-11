// ============================================================================
// Simpli Framework - Virtual Module Provider
// ============================================================================
// Provides virtual modules to the Vite build system. Virtual modules are
// dynamically generated JavaScript modules that don't exist on disk.
// They are resolved by Vite to provide runtime access to:
//   - Site configuration
//   - Auto-generated route tree
//   - Sidebar navigation structure
//   - Search index data
//   - Document metadata
//
// Usage in application code:
//   import config from 'virtual:simpli/config';
//   import { routes } from 'virtual:simpli/routes';
// ============================================================================

import type { SimpliConfig, SidebarItem } from '../config/types';
import type { GeneratedRoute } from '../router/RouteGenerator';

/** All virtual module IDs that Simpli provides */
export const VIRTUAL_MODULE_IDS = [
    'virtual:simpli/config',
    'virtual:simpli/routes',
    'virtual:simpli/sidebar',
    'virtual:simpli/search-index',
    'virtual:simpli/metadata',
    'virtual:simpli/versions',
] as const;

export type VirtualModuleId = (typeof VIRTUAL_MODULE_IDS)[number];

/** Prefix used by Vite to mark resolved virtual modules */
export const VIRTUAL_PREFIX = '\0';

/**
 * Check if a module ID is a Simpli virtual module.
 */
export function isVirtualModule(id: string): boolean {
    return VIRTUAL_MODULE_IDS.includes(id as VirtualModuleId);
}

/**
 * Resolve a virtual module ID (add the \0 prefix for Vite).
 */
export function resolveVirtualId(id: string): string {
    return VIRTUAL_PREFIX + id;
}

/**
 * Strip the \0 prefix to get the original virtual module ID.
 */
export function stripVirtualPrefix(id: string): string {
    return id.startsWith(VIRTUAL_PREFIX) ? id.slice(1) : id;
}

// ---------------------------------------------------------------------------
// Module generators
// ---------------------------------------------------------------------------

export interface VirtualModuleContext {
    config: SimpliConfig;
    routes: GeneratedRoute[];
    sidebar: Record<string, SidebarItem[]>;
    searchIndex: SearchDocumentData[];
    metadata: DocMetadataMap;
}

interface SearchDocumentData {
    id: string;
    title: string;
    content: string;
    path: string;
    headings: string[];
    tags: string[];
    section: string;
}

type DocMetadataMap = Record<
    string,
    {
        title: string;
        description?: string;
        path: string;
        tags?: string[];
        lastUpdate?: string;
    }
>;

/**
 * Generate the code for a virtual module.
 */
export function generateVirtualModule(
    id: VirtualModuleId,
    context: VirtualModuleContext,
): string {
    switch (id) {
        case 'virtual:simpli/config':
            return generateConfigModule(context.config);
        case 'virtual:simpli/routes':
            return generateRoutesModule(context.routes);
        case 'virtual:simpli/sidebar':
            return generateSidebarModule(context.sidebar);
        case 'virtual:simpli/search-index':
            return generateSearchIndexModule(context.searchIndex);
        case 'virtual:simpli/metadata':
            return generateMetadataModule(context.metadata);
        case 'virtual:simpli/versions':
            return generateVersionsModule(context.config);
        default:
            throw new Error(`[simpli:virtual] Unknown virtual module: ${id}`);
    }
}

// ---------------------------------------------------------------------------
// Individual module generators
// ---------------------------------------------------------------------------

function generateConfigModule(config: SimpliConfig): string {
    // Strip non-serializable values and internal paths
    const clientConfig = {
        title: config.title,
        tagline: config.tagline,
        url: config.url,
        baseUrl: config.baseUrl,
        favicon: config.favicon,
        organizationName: config.organizationName,
        projectName: config.projectName,
        themeConfig: config.themeConfig,
        i18n: config.i18n,
        customFields: config.customFields,
    };

    return `const config = ${JSON.stringify(clientConfig, null, 2)};
export default config;
export const { title, tagline, url, baseUrl, themeConfig, i18n, customFields } = config;
`;
}

function generateRoutesModule(routes: GeneratedRoute[]): string {
    const imports: string[] = [];
    const routeObjects: string[] = [];

    routes.forEach((route, index) => {
        const varName = `Route${index}`;
        // Use dynamic import for code splitting
        imports.push(
            `const ${varName} = () => import(${JSON.stringify(route.filePath)});`,
        );
        routeObjects.push(`  {
    path: ${JSON.stringify(route.path)},
    component: ${varName},
    metadata: ${JSON.stringify(route.metadata ?? {})},
  }`);
    });

    return `${imports.join('\n')}

export const routes = [
${routeObjects.join(',\n')}
];

export default routes;
`;
}

function generateSidebarModule(
    sidebar: Record<string, SidebarItem[]>,
): string {
    return `const sidebar = ${JSON.stringify(sidebar, null, 2)};
export default sidebar;
`;
}

function generateSearchIndexModule(docs: SearchDocumentData[]): string {
    return `const searchIndex = ${JSON.stringify(docs)};
export default searchIndex;
`;
}

function generateMetadataModule(metadata: DocMetadataMap): string {
    return `const metadata = ${JSON.stringify(metadata, null, 2)};
export default metadata;
export function getDocMeta(id) { return metadata[id]; }
`;
}

function generateVersionsModule(config: SimpliConfig): string {
    const versions = config.versioning?.versions ?? {};
    const lastVersion = config.versioning?.lastVersion;

    return `export const versions = ${JSON.stringify(versions, null, 2)};
export const lastVersion = ${JSON.stringify(lastVersion)};
export const isVersioningEnabled = ${JSON.stringify(config.versioning?.enabled ?? false)};
export default { versions, lastVersion, isVersioningEnabled };
`;
}
