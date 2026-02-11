// ============================================================================
// Simpli Framework - Hook Registry
// ============================================================================
// WordPress/Tapable-inspired hook system for plugin extensibility.
// Supports 4 hook types: sync, async, waterfall, bail
//
// Sync:      Execute all handlers in order, ignore return values
// Async:     Execute all handlers in order, await each
// Waterfall: Each handler receives previous handler's return value
// Bail:      Stop at first handler that returns non-undefined value
// ============================================================================

export type HookType = 'sync' | 'async' | 'waterfall' | 'bail';

interface HookHandler {
    /** Plugin that registered this handler */
    pluginName: string;
    /** Handler function */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (...args: any[]) => unknown;
    /** Priority (lower = earlier). Default: 10 */
    priority: number;
}

interface HookDefinition {
    type: HookType;
    handlers: HookHandler[];
    /** Whether handlers need re-sorting */
    dirty: boolean;
}

export class HookRegistry {
    private hooks = new Map<string, HookDefinition>();

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /**
     * Register a hook handler (tap into a hook).
     *
     * @param hookName - Name of the hook (e.g. 'config:loaded')
     * @param pluginName - Name of the plugin registering the handler
     * @param fn - Handler function
     * @param options - Optional priority and hook type
     */
    tap(
        hookName: string,
        pluginName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fn: (...args: any[]) => unknown,
        options: { priority?: number; type?: HookType } = {},
    ): void {
        const { priority = 10, type = 'sync' } = options;

        let hook = this.hooks.get(hookName);
        if (!hook) {
            hook = { type, handlers: [], dirty: false };
            this.hooks.set(hookName, hook);
        }

        hook.handlers.push({ pluginName, fn, priority });
        hook.dirty = true;
    }

    /**
     * Remove all handlers for a specific plugin.
     */
    untap(pluginName: string): void {
        for (const hook of this.hooks.values()) {
            hook.handlers = hook.handlers.filter((h) => h.pluginName !== pluginName);
        }
    }

    /**
     * Check if a hook has any handlers registered.
     */
    hasHandlers(hookName: string): boolean {
        const hook = this.hooks.get(hookName);
        return hook ? hook.handlers.length > 0 : false;
    }

    // -------------------------------------------------------------------------
    // Execution
    // -------------------------------------------------------------------------

    /**
     * Call a sync hook. Executes all handlers in order.
     * Return values are ignored.
     */
    call(hookName: string, ...args: unknown[]): void {
        const handlers = this.getSortedHandlers(hookName);
        for (const handler of handlers) {
            handler.fn(...args);
        }
    }

    /**
     * Call an async hook. Executes all handlers in order, awaiting each.
     */
    async callAsync(hookName: string, ...args: unknown[]): Promise<void> {
        const handlers = this.getSortedHandlers(hookName);
        for (const handler of handlers) {
            await handler.fn(...args);
        }
    }

    /**
     * Call a waterfall hook. Each handler receives the return value
     * of the previous handler as its first argument.
     *
     * @param hookName - Hook name
     * @param initial - Initial value passed to the first handler
     * @param args - Additional arguments passed to all handlers
     * @returns The final transformed value
     */
    waterfall<T>(hookName: string, initial: T, ...args: unknown[]): T {
        const handlers = this.getSortedHandlers(hookName);
        let value = initial;

        for (const handler of handlers) {
            const result = handler.fn(value, ...args);
            if (result !== undefined) {
                value = result as T;
            }
        }

        return value;
    }

    /**
     * Call an async waterfall hook.
     */
    async waterfallAsync<T>(
        hookName: string,
        initial: T,
        ...args: unknown[]
    ): Promise<T> {
        const handlers = this.getSortedHandlers(hookName);
        let value = initial;

        for (const handler of handlers) {
            const result = await handler.fn(value, ...args);
            if (result !== undefined) {
                value = result as T;
            }
        }

        return value;
    }

    /**
     * Call a bail hook. Stops at the first handler that returns
     * a non-undefined value.
     *
     * @returns The first non-undefined return value, or undefined
     */
    bail<T = unknown>(hookName: string, ...args: unknown[]): T | undefined {
        const handlers = this.getSortedHandlers(hookName);

        for (const handler of handlers) {
            const result = handler.fn(...args);
            if (result !== undefined) {
                return result as T;
            }
        }

        return undefined;
    }

    /**
     * Call an async bail hook.
     */
    async bailAsync<T = unknown>(
        hookName: string,
        ...args: unknown[]
    ): Promise<T | undefined> {
        const handlers = this.getSortedHandlers(hookName);

        for (const handler of handlers) {
            const result = await handler.fn(...args);
            if (result !== undefined) {
                return result as T;
            }
        }

        return undefined;
    }

    // -------------------------------------------------------------------------
    // Parallel execution (for independent async operations)
    // -------------------------------------------------------------------------

    /**
     * Call all handlers in parallel (for non-dependent async operations).
     */
    async callParallel(hookName: string, ...args: unknown[]): Promise<void> {
        const handlers = this.getSortedHandlers(hookName);
        await Promise.all(handlers.map((h) => h.fn(...args)));
    }

    // -------------------------------------------------------------------------
    // Introspection
    // -------------------------------------------------------------------------

    /**
     * Get all registered hook names.
     */
    getHookNames(): string[] {
        return Array.from(this.hooks.keys());
    }

    /**
     * Get handler count for a specific hook.
     */
    getHandlerCount(hookName: string): number {
        return this.hooks.get(hookName)?.handlers.length ?? 0;
    }

    /**
     * Clear all hooks.
     */
    clear(): void {
        this.hooks.clear();
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    private getSortedHandlers(hookName: string): HookHandler[] {
        const hook = this.hooks.get(hookName);
        if (!hook || hook.handlers.length === 0) return [];

        if (hook.dirty) {
            hook.handlers.sort((a, b) => a.priority - b.priority);
            hook.dirty = false;
        }

        return hook.handlers;
    }
}
