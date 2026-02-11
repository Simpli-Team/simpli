// ============================================================================
// Simpli Framework - Main Vite Plugin
// ============================================================================
// The central Vite plugin that orchestrates the entire build:
//   1. Loads simpli.config.ts
//   2. Initializes the plugin system
//   3. Scans content directories for MDX files
//   4. Generates virtual modules (config, routes, sidebar, search)
//   5. Watches for changes and invalidates modules
//   6. Configures MDX transformation pipeline
//
// This plugin is the bridge between the build tool and the framework.
// ============================================================================

import type { Plugin, ViteDevServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../config/loader';
import { PluginManager } from '../plugin/PluginManager';
import { generateRoutes, type GeneratedRoute } from '../router/RouteGenerator';
import {
    isVirtualModule,
    resolveVirtualId,
    stripVirtualPrefix,
    generateVirtualModule,
    VIRTUAL_MODULE_IDS,
    type VirtualModuleId,
    type VirtualModuleContext,
} from './virtualModules';
import type { SimpliConfig, SidebarItem } from '../config/types';
import { createMDXTransform } from './mdxTransform';

export interface SimpliVitePluginOptions {
    /** Project root directory. Defaults to process.cwd() */
    root?: string;
    /** Direct config object (bypasses file loading) */
    config?: SimpliConfig;
}

/**
 * The main Simpli Vite plugin.
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { simpliPlugin } from './src/core/vite/plugin';
 *
 * export default defineConfig({
 *   plugins: [simpliPlugin()],
 * });
 * ```
 */
export function simpliPlugin(options: SimpliVitePluginOptions = {}): Plugin {
    let config: SimpliConfig;
    let pluginManager: PluginManager;
    let routes: GeneratedRoute[] = [];
    let vmContext: VirtualModuleContext;
    let rootDir: string;
    let _server: ViteDevServer | undefined;
    // _server is assigned in configureServer hook - use void to suppress TS error
    void _server;

    return {
        name: 'simpli-framework',
        enforce: 'pre', // Run before other plugins

        // -----------------------------------------------------------------------
        // Config Hook - Configure MDX transform and optimize deps
        // -----------------------------------------------------------------------
        config(config) {
            return {
                plugins: [
                    createMDXTransform({
                        config: config as SimpliConfig,
                    }),
                ],
                optimizeDeps: {
                    include: [
                        'react',
                        'react-dom',
                        'react/jsx-runtime',
                        'react/jsx-dev-runtime',
                        '@mdx-js/react',
                    ],
                },
            };
        },

        // -----------------------------------------------------------------------
        // Config Resolved Hook - Load and process simpli.config.ts
        // -----------------------------------------------------------------------
        async configResolved(resolvedConfig) {
            rootDir = options.root ?? resolvedConfig.root ?? process.cwd();

            // Load config
            if (options.config) {
                config = options.config;
            } else {
                config = await loadConfig(rootDir);
            }

            // Initialize plugin manager
            pluginManager = new PluginManager();
            if (config.plugins) {
                pluginManager.registerAll(config.plugins);
            }
            pluginManager.initialize();

            // Apply plugin config hooks
            config = pluginManager.applyConfigHooks(config);

            // Generate routes from content
            routes = scanContentRoutes(config, rootDir);

            // Apply plugin route hooks
            const routeConfigs = routes.map((r) => ({
                path: r.path,
                component: r.component,
                metadata: r.metadata as Record<string, unknown>,
            }));
            pluginManager.applyRouteHooks(routeConfigs);

            // Build virtual module context
            vmContext = buildVirtualContext(config, routes);
        },

        // -----------------------------------------------------------------------
        // Virtual Module Resolution
        // -----------------------------------------------------------------------
        resolveId(id) {
            if (isVirtualModule(id)) {
                return resolveVirtualId(id);
            }
            return null;
        },

        load(id) {
            if (!id.startsWith('\0virtual:simpli/')) return null;

            const originalId = stripVirtualPrefix(id) as VirtualModuleId;
            if (!VIRTUAL_MODULE_IDS.includes(originalId)) return null;

            try {
                return generateVirtualModule(originalId, vmContext);
            } catch (error) {
                console.error(
                    `[simpli] Error generating virtual module "${originalId}":`,
                    error,
                );
                return `export default {};`;
            }
        },

        // -----------------------------------------------------------------------
        // Dev Server - Watch for changes
        // -----------------------------------------------------------------------
        configureServer(devServer) {
            _server = devServer;

            // Watch content directories for changes
            const watchDirs = [
                config.docsDir,
                config.blogDir,
            ].filter((dir) => dir && fs.existsSync(dir as string)) as string[];

            for (const dir of watchDirs) {
                devServer.watcher.add(dir);
            }

            // Watch config file
            const configFiles = [
                'simpli.config.ts',
                'simpli.config.js',
                'simpli.config.mjs',
            ];
            for (const file of configFiles) {
                const fullPath = path.resolve(rootDir, file);
                if (fs.existsSync(fullPath)) {
                    devServer.watcher.add(fullPath);
                }
            }

            // Handle file changes
            devServer.watcher.on('change', (filePath) => {
                handleFileChange(filePath, devServer);
            });

            devServer.watcher.on('add', (filePath) => {
                handleFileChange(filePath, devServer);
            });

            devServer.watcher.on('unlink', (filePath) => {
                handleFileChange(filePath, devServer);
            });
        },

        // -----------------------------------------------------------------------
        // Build - Generate static content
        // -----------------------------------------------------------------------
        async buildStart() {
            // Ensure content directories exist
            const docsDir = config.docsDir ?? path.resolve(rootDir, 'docs');
            if (!fs.existsSync(docsDir)) {
                fs.mkdirSync(docsDir, { recursive: true });
            }
        },
    };

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    function handleFileChange(filePath: string, devServer: ViteDevServer) {
        const normalized = filePath.replace(/\\/g, '/');

        // Config file changed - full reload
        if (normalized.includes('simpli.config')) {
            console.log('[simpli] Config changed. Full reload...');
            devServer.restart();
            return;
        }

        // Content file changed - regenerate routes and invalidate virtual modules
        const isContentFile =
            normalized.endsWith('.mdx') || normalized.endsWith('.md');
        if (isContentFile) {
            console.log(`[simpli] Content changed: ${path.basename(normalized)}`);

            // Regenerate routes
            routes = scanContentRoutes(config, rootDir);
            vmContext = buildVirtualContext(config, routes);

            // Invalidate all virtual modules
            for (const vmId of VIRTUAL_MODULE_IDS) {
                const resolved = resolveVirtualId(vmId);
                const mod = devServer.moduleGraph.getModuleById(resolved);
                if (mod) {
                    devServer.moduleGraph.invalidateModule(mod);
                }
            }

            // Send HMR update
            devServer.ws.send({ type: 'full-reload' });
        }
    }
}

// -----------------------------------------------------------------------------
// Content scanning
// -----------------------------------------------------------------------------

function scanContentRoutes(
    config: SimpliConfig,
    rootDir: string,
): GeneratedRoute[] {
    const allRoutes: GeneratedRoute[] = [];

    // Scan docs directory
    const docsDir = config.docsDir ?? path.resolve(rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
        const docRoutes = generateRoutes({
            basePath: '/docs',
            contentDir: docsDir,
            extensions: ['.mdx', '.md'],
        });
        allRoutes.push(...docRoutes);
    }

    // Scan blog directory
    const blogDir = config.blogDir ?? path.resolve(rootDir, 'blog');
    if (fs.existsSync(blogDir)) {
        const blogRoutes = generateRoutes({
            basePath: '/blog',
            contentDir: blogDir,
            extensions: ['.mdx', '.md'],
        });
        allRoutes.push(...blogRoutes);
    }

    // Scan pages directory
    const pagesDir = config.pagesDir ?? path.resolve(rootDir, 'src/pages');
    if (fs.existsSync(pagesDir)) {
        const pageRoutes = generateRoutes({
            basePath: '',
            contentDir: pagesDir,
            extensions: ['.mdx', '.md', '.tsx', '.jsx'],
        });
        allRoutes.push(...pageRoutes);
    }

    return allRoutes;
}

// -----------------------------------------------------------------------------
// Virtual module context builder
// -----------------------------------------------------------------------------

function buildVirtualContext(
    config: SimpliConfig,
    routes: GeneratedRoute[],
): VirtualModuleContext {
    // Build sidebar from config or auto-generate
    const sidebar = buildSidebar(config, routes);

    // Build search index
    const searchIndex = routes.map((route) => ({
        id: route.path,
        title: (route.metadata?.title as string) ?? pathToTitle(route.path),
        content: '', // Will be populated during MDX processing
        path: route.path,
        headings: [],
        tags: (route.metadata?.tags ?? []) as string[],
        section: route.path.split('/')[1] ?? '',
    }));

    // Build metadata map
    const metadata: Record<string, {
        title: string;
        description?: string;
        path: string;
        tags?: string[];
        lastUpdate?: string;
    }> = {};
    for (const route of routes) {
        metadata[route.path] = {
            title: (route.metadata?.title as string) ?? pathToTitle(route.path),
            description: route.metadata?.description as string | undefined,
            path: route.path,
            tags: route.metadata?.tags as string[] | undefined,
        };
    }

    return {
        config,
        routes,
        sidebar,
        searchIndex,
        metadata,
    };
}

// -----------------------------------------------------------------------------
// Sidebar builder
// -----------------------------------------------------------------------------

function buildSidebar(
    config: SimpliConfig,
    routes: GeneratedRoute[],
): Record<string, SidebarItem[]> {
    // If user defined sidebars in config, use those
    if (config.sidebars && Object.keys(config.sidebars).length > 0) {
        return config.sidebars;
    }

    // Auto-generate sidebar from routes
    const docRoutes = routes.filter((r) => r.path.startsWith('/docs'));
    if (docRoutes.length === 0) return {};

    const items: SidebarItem[] = [];
    const categories = new Map<string, SidebarItem[]>();

    for (const route of docRoutes) {
        const segments = route.path.replace(/^\/docs\/?/, '').split('/');

        if (segments.length === 1 && segments[0] !== '') {
            // Top-level doc
            items.push({
                type: 'doc',
                id: segments[0],
                label: pathToTitle(segments[0]),
            });
        } else if (segments.length > 1) {
            // Nested doc - add to category
            const categoryName = segments[0];
            if (!categories.has(categoryName)) {
                categories.set(categoryName, []);
            }
            categories.get(categoryName)!.push({
                type: 'doc',
                id: segments.join('/'),
                label: pathToTitle(segments[segments.length - 1]),
            });
        }
    }

    // Add categories
    for (const [name, categoryItems] of categories) {
        items.push({
            type: 'category',
            label: pathToTitle(name),
            collapsed: false,
            items: categoryItems,
        });
    }

    return { docs: items };
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function pathToTitle(pathSegment: string): string {
    return pathSegment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim() || 'Home';
}
