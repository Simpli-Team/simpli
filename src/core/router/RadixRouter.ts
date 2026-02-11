// ============================================================================
// Simpli Framework - Radix Tree Router
// ============================================================================
// High-performance trie-based router with O(k) matching (k = path length).
// Supports: static segments, named params (:slug), wildcards (*), catch-all (**)
//
// This is significantly faster than linear route matching O(n) used by
// most frameworks when route count grows large (100+ docs).
//
// Architecture:
//   - Each node represents a path segment
//   - Children are stored in a Map for O(1) segment lookup
//   - Special nodes for :param and * wildcard segments
//   - Route data (component, metadata) stored at leaf nodes
// ============================================================================

export interface RouteMatch<T = unknown> {
    data: T;
    params: Record<string, string>;
    path: string;
}

interface RadixNode<T> {
    /** The path segment this node represents */
    segment: string;
    /** Route data if this is a terminal node */
    data?: T;
    /** Static children keyed by segment */
    children: Map<string, RadixNode<T>>;
    /** Named parameter child (e.g. :slug) - only one per level */
    paramChild?: RadixNode<T>;
    /** Parameter name (e.g. "slug" from ":slug") */
    paramName?: string;
    /** Wildcard/catch-all child (matches everything) */
    wildcardChild?: RadixNode<T>;
    /** Whether this is a catch-all node (**) */
    isCatchAll?: boolean;
}

export class RadixRouter<T = unknown> {
    private root: RadixNode<T>;
    private routeCount = 0;

    constructor() {
        this.root = this.createNode('');
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Insert a route into the radix tree.
     *
     * @param path - URL path pattern (e.g. "/docs/:slug", "/api/**")
     * @param data - Route data (component path, metadata, etc.)
     *
     * Path patterns:
     *   /docs/intro        → Static path
     *   /docs/:slug        → Named parameter
     *   /docs/:cat/:page   → Multiple parameters
     *   /api/**            → Catch-all wildcard
     */
    insert(path: string, data: T): void {
        const segments = this.parsePath(path);
        let current = this.root;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (segment === '**' || segment === '*') {
                // Catch-all: matches any remaining path segments
                if (!current.wildcardChild) {
                    current.wildcardChild = this.createNode('**');
                    current.wildcardChild.isCatchAll = true;
                }
                current = current.wildcardChild;
            } else if (segment.startsWith(':')) {
                // Named parameter
                const paramName = segment.slice(1);
                if (!current.paramChild) {
                    current.paramChild = this.createNode(segment);
                    current.paramChild.paramName = paramName;
                }
                current = current.paramChild;
            } else {
                // Static segment
                let child = current.children.get(segment);
                if (!child) {
                    child = this.createNode(segment);
                    current.children.set(segment, child);
                }
                current = child;
            }
        }

        if (current.data !== undefined) {
            console.warn(
                `[simpli:router] Route "${path}" already exists. Overwriting.`,
            );
        }

        current.data = data;
        this.routeCount++;
    }

    /**
     * Match a URL path against the route tree.
     * Returns the matching route data and extracted parameters.
     *
     * Matching priority (highest to lowest):
     *   1. Exact static match
     *   2. Named parameter match
     *   3. Catch-all wildcard match
     */
    match(path: string): RouteMatch<T> | null {
        const segments = this.parsePath(path);
        const params: Record<string, string> = {};

        const result = this.matchNode(this.root, segments, 0, params);
        if (result) {
            return { data: result, params, path };
        }

        return null;
    }

    /**
     * Remove a route from the tree.
     */
    remove(path: string): boolean {
        const segments = this.parsePath(path);
        return this.removeNode(this.root, segments, 0);
    }

    /**
     * Get all registered routes as an array of [path, data] tuples.
     */
    getAllRoutes(): Array<[string, T]> {
        const routes: Array<[string, T]> = [];
        this.collectRoutes(this.root, '', routes);
        return routes;
    }

    /**
     * Get total number of registered routes.
     */
    get size(): number {
        return this.routeCount;
    }

    /**
     * Check if a specific path is registered.
     */
    has(path: string): boolean {
        return this.match(path) !== null;
    }

    /**
     * Clear all routes.
     */
    clear(): void {
        this.root = this.createNode('');
        this.routeCount = 0;
    }

    // -------------------------------------------------------------------------
    // Private Implementation
    // -------------------------------------------------------------------------

    private createNode(segment: string): RadixNode<T> {
        return {
            segment,
            children: new Map(),
        };
    }

    /**
     * Recursive matching with priority:
     * 1. Static children (exact segment match)
     * 2. Parameter child (:param)
     * 3. Wildcard child (**)
     */
    private matchNode(
        node: RadixNode<T>,
        segments: string[],
        index: number,
        params: Record<string, string>,
    ): T | null {
        // Base case: consumed all segments
        if (index === segments.length) {
            return node.data ?? null;
        }

        const segment = segments[index];

        // Priority 1: Exact static match
        const staticChild = node.children.get(segment);
        if (staticChild) {
            const result = this.matchNode(staticChild, segments, index + 1, params);
            if (result !== null) return result;
        }

        // Priority 2: Named parameter match
        if (node.paramChild) {
            const prevValue = params[node.paramChild.paramName!];
            params[node.paramChild.paramName!] = decodeURIComponent(segment);

            const result = this.matchNode(
                node.paramChild,
                segments,
                index + 1,
                params,
            );
            if (result !== null) return result;

            // Backtrack: restore previous param value
            if (prevValue !== undefined) {
                params[node.paramChild.paramName!] = prevValue;
            } else {
                delete params[node.paramChild.paramName!];
            }
        }

        // Priority 3: Catch-all wildcard (consumes all remaining segments)
        if (node.wildcardChild && node.wildcardChild.data !== undefined) {
            const remaining = segments.slice(index).map(decodeURIComponent);
            params['*'] = remaining.join('/');
            return node.wildcardChild.data;
        }

        return null;
    }

    private removeNode(
        node: RadixNode<T>,
        segments: string[],
        index: number,
    ): boolean {
        if (index === segments.length) {
            if (node.data !== undefined) {
                node.data = undefined;
                this.routeCount--;
                return true;
            }
            return false;
        }

        const segment = segments[index];

        if (segment === '**' || segment === '*') {
            if (node.wildcardChild) {
                return this.removeNode(node.wildcardChild, segments, index + 1);
            }
        } else if (segment.startsWith(':')) {
            if (node.paramChild) {
                return this.removeNode(node.paramChild, segments, index + 1);
            }
        } else {
            const child = node.children.get(segment);
            if (child) {
                const removed = this.removeNode(child, segments, index + 1);
                // Clean up empty nodes
                if (
                    removed &&
                    child.data === undefined &&
                    child.children.size === 0 &&
                    !child.paramChild &&
                    !child.wildcardChild
                ) {
                    node.children.delete(segment);
                }
                return removed;
            }
        }

        return false;
    }

    private collectRoutes(
        node: RadixNode<T>,
        prefix: string,
        routes: Array<[string, T]>,
    ): void {
        const currentPath =
            node.segment === '' ? prefix : `${prefix}/${node.segment}`;

        if (node.data !== undefined) {
            routes.push([currentPath || '/', node.data]);
        }

        // Static children
        for (const child of node.children.values()) {
            this.collectRoutes(child, currentPath, routes);
        }

        // Param child
        if (node.paramChild) {
            this.collectRoutes(
                node.paramChild,
                `${currentPath}/:${node.paramChild.paramName}`,
                routes,
            );
        }

        // Wildcard
        if (node.wildcardChild) {
            this.collectRoutes(node.wildcardChild, `${currentPath}/**`, routes);
        }
    }

    /**
     * Parse a URL path into normalized segments.
     * Removes leading/trailing slashes and splits by '/'.
     */
    private parsePath(path: string): string[] {
        const normalized = path.replace(/^\/+|\/+$/g, '');
        if (normalized === '') return [];
        return normalized.split('/');
    }
}
