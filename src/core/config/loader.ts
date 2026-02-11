// ============================================================================
// Simpli Framework - Config Loader
// ============================================================================
// Responsible for discovering, loading, and validating simpli.config.ts
// Used by the Vite plugin at build time to provide config as virtual module.
// ============================================================================

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { mergeWithDefaults } from './defaults';
import type { SimpliConfig } from './types';

/**
 * Discover the config file path from project root.
 * Searches for: simpli.config.ts, simpli.config.js, simpli.config.mjs
 */
export function discoverConfigFile(rootDir: string): string | null {
    const candidates = [
        'simpli.config.ts',
        'simpli.config.js',
        'simpli.config.mjs',
        'simpli.config.mts',
    ];

    for (const candidate of candidates) {
        const fullPath = path.resolve(rootDir, candidate);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }

    return null;
}

/**
 * Load and validate the Simpli config file.
 * Returns a fully merged config with defaults applied.
 */
export async function loadConfig(rootDir: string): Promise<SimpliConfig> {
    const configPath = discoverConfigFile(rootDir);

    if (!configPath) {
        // No config file found - use all defaults with just a title
        console.warn(
            '[simpli] No simpli.config.ts found. Using default configuration.',
        );
        return mergeWithDefaults({ title: 'Simpli Documentation' });
    }

    try {
        // For TypeScript files, Vite handles ts->js transform.
        // When running standalone (CLI), we need to use dynamic import.
        const fileUrl = pathToFileURL(configPath).href;
        const module = await import(/* @vite-ignore */ fileUrl);
        const userConfig: Partial<SimpliConfig> = module.default ?? module;

        // Validate required fields
        validateConfig(userConfig, configPath);

        // Merge with defaults
        const mergedConfig = mergeWithDefaults(userConfig);

        // Resolve relative paths
        return resolveConfigPaths(mergedConfig, rootDir);
    } catch (error) {
        throw new Error(
            `[simpli] Failed to load config from ${configPath}:\n${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Validate that minimum required fields are present.
 */
function validateConfig(
    config: Partial<SimpliConfig>,
    filePath: string,
): void {
    if (!config.title || typeof config.title !== 'string') {
        throw new Error(
            `[simpli] Config at ${filePath} must specify a "title" (string).`,
        );
    }

    if (config.url && !isValidUrl(config.url)) {
        throw new Error(
            `[simpli] Config "url" must be a valid URL. Got: "${config.url}"`,
        );
    }

    if (config.baseUrl && !config.baseUrl.startsWith('/')) {
        throw new Error(
            `[simpli] Config "baseUrl" must start with "/". Got: "${config.baseUrl}"`,
        );
    }

    // Validate theme config
    if (config.themeConfig?.search?.provider === 'algolia') {
        const algolia = config.themeConfig.search.algolia;
        if (!algolia?.appId || !algolia?.apiKey || !algolia?.indexName) {
            throw new Error(
                `[simpli] Algolia search requires "appId", "apiKey", and "indexName".`,
            );
        }
    }
}

/**
 * Resolve relative directory paths against project root.
 */
function resolveConfigPaths(
    config: SimpliConfig,
    rootDir: string,
): SimpliConfig {
    return {
        ...config,
        docsDir: path.resolve(rootDir, config.docsDir ?? 'docs'),
        blogDir: path.resolve(rootDir, config.blogDir ?? 'blog'),
        pagesDir: path.resolve(rootDir, config.pagesDir ?? 'src/pages'),
        staticDir: path.resolve(rootDir, config.staticDir ?? 'static'),
        build: {
            ...config.build,
            outDir: path.resolve(rootDir, config.build?.outDir ?? 'build'),
        },
    };
}

function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Serialize config to a JavaScript module string for virtual module.
 * Strips non-serializable values (functions, undefined).
 */
export function serializeConfig(config: SimpliConfig): string {
    const serializable = JSON.parse(JSON.stringify(config));
    return `export default ${JSON.stringify(serializable, null, 2)};`;
}
