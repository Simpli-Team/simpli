// ============================================================================
// Simpli Framework - Route Generator
// ============================================================================
// Automatically generates routes from the file system (docs/, blog/, pages/).
// Converts file paths to URL routes following conventions.
//
// Convention:
//   docs/index.mdx           → /docs
//   docs/getting-started.mdx → /docs/getting-started
//   docs/guides/intro.mdx    → /docs/guides/intro
//   docs/[slug].mdx          → /docs/:slug  (dynamic)
//   docs/[...path].mdx       → /docs/**     (catch-all)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type { RouteConfig, DocMetadata } from '../config/types';

export interface GeneratedRoute {
    /** URL path */
    path: string;
    /** Absolute path to the MDX/MD source file */
    filePath: string;
    /** Component path for lazy loading */
    component: string;
    /** Extracted metadata from frontmatter */
    metadata?: Partial<DocMetadata>;
    /** Sort position from frontmatter or _category_.json */
    position?: number;
}

export interface RouteGeneratorOptions {
    /** Base URL prefix (e.g. '/docs') */
    basePath: string;
    /** Absolute path to content directory */
    contentDir: string;
    /** File extensions to include */
    extensions?: string[];
    /** Whether to include draft content */
    includeDrafts?: boolean;
}

// Category metadata from _category_.json files
interface CategoryMeta {
    label?: string;
    position?: number;
    collapsed?: boolean;
    collapsible?: boolean;
    className?: string;
    link?: {
        type: 'doc' | 'generated-index';
        id?: string;
        title?: string;
        description?: string;
    };
}

/**
 * Generate routes from a content directory.
 */
export function generateRoutes(options: RouteGeneratorOptions): GeneratedRoute[] {
    const {
        basePath,
        contentDir,
        extensions = ['.mdx', '.md'],
        includeDrafts = false,
    } = options;

    if (!fs.existsSync(contentDir)) {
        return [];
    }

    const routes: GeneratedRoute[] = [];
    scanDirectory(contentDir, contentDir, basePath, extensions, includeDrafts, routes);

    // Sort routes: static before dynamic, then by position/name
    routes.sort((a, b) => {
        // Static routes first
        const aDynamic = a.path.includes(':') || a.path.includes('*');
        const bDynamic = b.path.includes(':') || b.path.includes('*');
        if (aDynamic !== bDynamic) return aDynamic ? 1 : -1;

        // Then by position
        const aPos = a.position ?? Infinity;
        const bPos = b.position ?? Infinity;
        if (aPos !== bPos) return aPos - bPos;

        // Then alphabetically
        return a.path.localeCompare(b.path);
    });

    return routes;
}

/**
 * Recursively scan directory for content files.
 */
function scanDirectory(
    dir: string,
    rootDir: string,
    basePath: string,
    extensions: string[],
    includeDrafts: boolean,
    routes: GeneratedRoute[],
): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Load category metadata if present
    const categoryMeta = loadCategoryMeta(dir);

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip hidden directories and node_modules
            if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                continue;
            }

            // Recurse into subdirectory
            const subBasePath = `${basePath}/${entry.name}`;
            scanDirectory(fullPath, rootDir, subBasePath, extensions, includeDrafts, routes);
            continue;
        }

        if (!entry.isFile()) continue;

        // Skip non-content files
        const ext = path.extname(entry.name);
        if (!extensions.includes(ext)) continue;

        // Skip category meta files
        if (entry.name === '_category_.json' || entry.name === '_category_.yml') {
            continue;
        }

        // Generate route from file
        const route = fileToRoute(fullPath, rootDir, basePath, categoryMeta);
        if (route) {
            routes.push(route);
        }
    }
}

/**
 * Convert a file path to a route definition.
 */
function fileToRoute(
    filePath: string,
    rootDir: string,
    basePath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _categoryMeta?: CategoryMeta | null,
): GeneratedRoute | null {
    const relativePath = path.relative(rootDir, filePath);
    const ext = path.extname(relativePath);
    const nameWithoutExt = relativePath.slice(0, -ext.length);

    // Convert file path to URL segments
    let urlPath = nameWithoutExt
        .split(path.sep)
        .map((segment) => fileSegmentToUrlSegment(segment))
        .join('/');

    // Handle index files
    if (urlPath.endsWith('/index')) {
        urlPath = urlPath.slice(0, -6); // Remove '/index'
    } else if (urlPath === 'index') {
        urlPath = '';
    }

    const fullPath = basePath + (urlPath ? `/${urlPath}` : '');

    return {
        path: fullPath || '/',
        filePath: filePath.replace(/\\/g, '/'),
        component: filePath.replace(/\\/g, '/'),
        position: undefined, // Will be populated from frontmatter
    };
}

/**
 * Convert a file name segment to a URL segment.
 *
 * Conventions:
 *   getting-started → getting-started (kebab-case preserved)
 *   [slug]          → :slug          (dynamic parameter)
 *   [...path]       → **             (catch-all)
 *   01-intro        → intro          (numeric prefix stripped)
 */
function fileSegmentToUrlSegment(segment: string): string {
    // Catch-all: [...path] → **
    if (segment.startsWith('[...') && segment.endsWith(']')) {
        return '**';
    }

    // Dynamic param: [slug] → :slug
    if (segment.startsWith('[') && segment.endsWith(']')) {
        return ':' + segment.slice(1, -1);
    }

    // Strip numeric prefix: 01-intro → intro
    const numericPrefixMatch = segment.match(/^\d+-(.+)$/);
    if (numericPrefixMatch) {
        return numericPrefixMatch[1];
    }

    return segment;
}

/**
 * Load _category_.json metadata from a directory.
 */
function loadCategoryMeta(dir: string): CategoryMeta | null {
    const jsonPath = path.join(dir, '_category_.json');

    if (fs.existsSync(jsonPath)) {
        try {
            const content = fs.readFileSync(jsonPath, 'utf-8');
            return JSON.parse(content) as CategoryMeta;
        } catch {
            console.warn(`[simpli:routes] Failed to parse ${jsonPath}`);
        }
    }

    return null;
}

/**
 * Convert GeneratedRoutes to RouteConfig format for the application.
 */
export function toRouteConfigs(routes: GeneratedRoute[]): RouteConfig[] {
    return routes.map((route) => ({
        path: route.path,
        component: route.component,
        metadata: route.metadata as Record<string, unknown> | undefined,
    }));
}

/**
 * Generate a route manifest as a JavaScript module string.
 * Used by the virtual module system to provide routes at runtime.
 */
export function serializeRoutes(routes: GeneratedRoute[]): string {
    const routeEntries = routes.map((route) => {
        return `  {
    path: ${JSON.stringify(route.path)},
    component: () => import(/* @vite-ignore */ ${JSON.stringify(route.filePath)}),
    metadata: ${JSON.stringify(route.metadata ?? {})},
  }`;
    });

    return `export const routes = [\n${routeEntries.join(',\n')}\n];\n`;
}
