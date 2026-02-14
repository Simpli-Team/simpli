// ============================================================================
// Simpli Framework - Plugin Manager
// ============================================================================
// Manages the full lifecycle of plugins: registration, initialization,
// hook wiring, and orderly shutdown. Each built-in feature (docs,
// search) is implemented as a plugin using this system.
//
// Lifecycle:
//   1. register()    → Plugin added to registry
//   2. initialize()  → All plugins initialized, hooks wired
//   3. Hook calls    → Plugins respond to events (config, content, build)
//   4. shutdown()    → Cleanup
// ============================================================================

import { HookRegistry } from './hooks';
import type {
    SimpliConfig,
    SimpliPluginInstance,
    PluginConfig,
    MarkdownConfig,
    RouteConfig,
    ContentLoadedArgs,
    PostBuildArgs,
} from '../config/types';

export type { SimpliPluginInstance };

export class PluginManager {
    private plugins: SimpliPluginInstance[] = [];
    private hooks: HookRegistry;
    private initialized = false;

    constructor() {
        this.hooks = new HookRegistry();
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /**
     * Register a plugin instance.
     *
     * @param plugin - Can be:
     *   - A SimpliPluginInstance object
     *   - A function that returns a SimpliPluginInstance
     *   - A [packageName, options] tuple (for npm plugins)
     */
    register(plugin: PluginConfig): void {
        if (this.initialized) {
            throw new Error(
                '[simpli:plugins] Cannot register plugins after initialization.',
            );
        }

        let instance: SimpliPluginInstance;

        if (typeof plugin === 'string') {
            // Package name - will be resolved later
            throw new Error(
                `[simpli:plugins] String plugin references not yet supported. Use plugin objects.`,
            );
        } else if (Array.isArray(plugin)) {
            // [packageName, options] tuple - will be resolved later
            throw new Error(
                `[simpli:plugins] Tuple plugin references not yet supported. Use plugin objects.`,
            );
        } else {
            instance = plugin as SimpliPluginInstance;
        }

        // Validate plugin
        if (!instance.name) {
            throw new Error('[simpli:plugins] Plugin must have a "name" property.');
        }

        // Check for duplicate names
        if (this.plugins.some((p) => p.name === instance.name)) {
            console.warn(
                `[simpli:plugins] Plugin "${instance.name}" already registered. Skipping duplicate.`,
            );
            return;
        }

        this.plugins.push(instance);
    }

    /**
     * Register multiple plugins at once.
     */
    registerAll(plugins: PluginConfig[]): void {
        for (const plugin of plugins) {
            this.register(plugin);
        }
    }

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    /**
     * Initialize all registered plugins by wiring their hooks.
     * Must be called after all plugins are registered.
     */
    initialize(): void {
        if (this.initialized) return;

        for (const plugin of this.plugins) {
            this.wirePluginHooks(plugin);
        }

        this.initialized = true;
    }

    /**
     * Wire a single plugin's lifecycle methods to the hook registry.
     */
    private wirePluginHooks(plugin: SimpliPluginInstance): void {
        const name = plugin.name;

        if (plugin.configLoaded) {
            this.hooks.tap('config:loaded', name, plugin.configLoaded.bind(plugin), {
                type: 'waterfall',
            });
        }

        if (plugin.contentLoaded) {
            this.hooks.tap(
                'content:loaded',
                name,
                plugin.contentLoaded.bind(plugin),
                { type: 'async' },
            );
        }

        if (plugin.routesResolved) {
            this.hooks.tap(
                'routes:resolved',
                name,
                plugin.routesResolved.bind(plugin),
                { type: 'waterfall' },
            );
        }

        if (plugin.postBuild) {
            this.hooks.tap('build:end', name, plugin.postBuild.bind(plugin), {
                type: 'async',
            });
        }

        if (plugin.extendMarkdown) {
            this.hooks.tap(
                'markdown:extend',
                name,
                plugin.extendMarkdown.bind(plugin),
                { type: 'waterfall' },
            );
        }

        if (plugin.transformContent) {
            this.hooks.tap(
                'content:transform',
                name,
                plugin.transformContent.bind(plugin),
                { type: 'waterfall' },
            );
        }
    }

    // -------------------------------------------------------------------------
    // Hook Execution (convenience wrappers)
    // -------------------------------------------------------------------------

    /**
     * Run config:loaded waterfall. Lets plugins modify the config.
     */
    applyConfigHooks(config: SimpliConfig): SimpliConfig {
        return this.hooks.waterfall('config:loaded', config);
    }

    /**
     * Run content:loaded async hook. Lets plugins process content.
     */
    async applyContentHooks(args: ContentLoadedArgs): Promise<void> {
        await this.hooks.callAsync('content:loaded', args);
    }

    /**
     * Run routes:resolved waterfall. Lets plugins modify routes.
     */
    applyRouteHooks(routes: RouteConfig[]): RouteConfig[] {
        return this.hooks.waterfall('routes:resolved', routes);
    }

    /**
     * Run markdown:extend waterfall. Lets plugins add remark/rehype plugins.
     */
    applyMarkdownHooks(mdConfig: MarkdownConfig): MarkdownConfig {
        return this.hooks.waterfall('markdown:extend', mdConfig);
    }

    /**
     * Run content:transform waterfall on a single content file.
     */
    transformContent(content: string, filePath: string): string {
        return this.hooks.waterfall('content:transform', content, filePath);
    }

    /**
     * Run build:end async hook.
     */
    async applyPostBuildHooks(args: PostBuildArgs): Promise<void> {
        await this.hooks.callAsync('build:end', args);
    }

    // -------------------------------------------------------------------------
    // Direct hook access (for advanced usage)
    // -------------------------------------------------------------------------

    /**
     * Get the underlying hook registry for direct manipulation.
     */
    getHooks(): HookRegistry {
        return this.hooks;
    }

    /**
     * Get all theme components contributed by plugins.
     */
    getThemeComponents(): Record<string, import('react').ComponentType> {
        const components: Record<string, import('react').ComponentType> = {};

        for (const plugin of this.plugins) {
            if (plugin.getThemeComponents) {
                Object.assign(components, plugin.getThemeComponents());
            }
        }

        return components;
    }

    /**
     * Get all client module paths contributed by plugins.
     */
    getClientModules(): string[] {
        const modules: string[] = [];

        for (const plugin of this.plugins) {
            if (plugin.getClientModules) {
                modules.push(...plugin.getClientModules());
            }
        }

        return modules;
    }

    // -------------------------------------------------------------------------
    // Introspection
    // -------------------------------------------------------------------------

    /**
     * Get list of all registered plugin names.
     */
    getPluginNames(): string[] {
        return this.plugins.map((p) => p.name);
    }

    /**
     * Get a specific plugin by name.
     */
    getPlugin(name: string): SimpliPluginInstance | undefined {
        return this.plugins.find((p) => p.name === name);
    }

    /**
     * Get total number of registered plugins.
     */
    get size(): number {
        return this.plugins.length;
    }

    /**
     * Check if the manager has been initialized.
     */
    get isInitialized(): boolean {
        return this.initialized;
    }
}

// ---------------------------------------------------------------------------
// Singleton instance for the application
// ---------------------------------------------------------------------------

let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
    if (!globalPluginManager) {
        globalPluginManager = new PluginManager();
    }
    return globalPluginManager;
}

export function resetPluginManager(): void {
    globalPluginManager = null;
}
