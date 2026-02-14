// ============================================================================
// Simpli Framework - Config Loader (Production Level)
// ============================================================================

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { mergeWithDefaults } from './defaults.js';
import { ConfigError } from '../errors/index.js';
import { configValidator } from '../validators/config.js';
import type { SimpliConfig, SimpliUserConfig } from './types.js';

const require = createRequire(import.meta.url);

const CONFIG_FILES = [
  'simpli.config.ts',
  'simpli.config.js',
  'simpli.config.mjs',
  'simpli.config.mts',
  'simpli.config.cjs',
] as const;

const configCache = new Map<string, { config: SimpliConfig; mtime: number }>();

export function discoverConfigFile(rootDir: string): string | null {
  for (const candidate of CONFIG_FILES) {
    const fullPath = path.resolve(rootDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

export function hasConfigChanged(configPath: string): boolean {
  const cached = configCache.get(configPath);
  if (!cached) return true;
  
  try {
    const stats = fs.statSync(configPath);
    return stats.mtimeMs > cached.mtime;
  } catch {
    return true;
  }
}

export function clearConfigCache(): void {
  configCache.clear();
}

export async function loadConfig(rootDir: string): Promise<SimpliConfig> {
  const configPath = discoverConfigFile(rootDir);

  if (!configPath) {
    console.warn('[simpli] No simpli.config.ts found. Using default configuration.');
    return mergeWithDefaults({ title: 'Simpli Documentation' });
  }

  if (!hasConfigChanged(configPath)) {
    const cached = configCache.get(configPath);
    if (cached) {
      return cached.config;
    }
  }

  try {
    const fileUrl = pathToFileURL(configPath).href + `?t=${Date.now()}`;
    const module = await import(/* @vite-ignore */ fileUrl);
    const userConfig: SimpliUserConfig = module.default ?? module;

    const validationResult = configValidator.validate(userConfig);
    
    if (!validationResult.valid) {
      const errors = validationResult.errors.map(e => 
        `  - ${e.field}: ${e.message}`
      ).join('\n');
      
      throw new ConfigError(
        `Configuration validation failed:\n${errors}`,
        { 
          details: { 
            configPath,
            errors: validationResult.errors.map(e => e.message),
            warnings: validationResult.warnings 
          } 
        }
      );
    }

    if (validationResult.warnings.length > 0) {
      console.warn('[simpli] Configuration warnings:');
      validationResult.warnings.forEach(w => console.warn(`  - ${w}`));
    }

    const mergedConfig = mergeWithDefaults(userConfig);
    const resolvedConfig = resolveConfigPaths(mergedConfig, rootDir);

    const stats = fs.statSync(configPath);
    configCache.set(configPath, { 
      config: resolvedConfig, 
      mtime: stats.mtimeMs 
    });

    return resolvedConfig;

  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError(
      `Failed to load config from ${configPath}`,
      { 
        details: { configPath, rootDir },
        cause: error instanceof Error ? error : undefined 
      }
    );
  }
}

export function loadConfigSync(rootDir: string): SimpliConfig {
  const configPath = discoverConfigFile(rootDir);

  if (!configPath) {
    return mergeWithDefaults({ title: 'Simpli Documentation' });
  }

  try {
    if (configPath.endsWith('.ts') || configPath.endsWith('.mts')) {
      throw new ConfigError(
        'TypeScript config files require async loading. Use loadConfig() instead.',
        { details: { configPath } }
      );
    }

    const module = require(configPath);
    const userConfig: SimpliUserConfig = module.default ?? module;

    const validationResult = configValidator.validate(userConfig);
    
    if (!validationResult.valid) {
      throw new ConfigError(
        'Configuration validation failed',
        { details: { errors: validationResult.errors.map(e => e.message) } }
      );
    }

    const mergedConfig = mergeWithDefaults(userConfig);
    return resolveConfigPaths(mergedConfig, rootDir);

  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError(
      `Failed to load config from ${configPath}`,
      { cause: error instanceof Error ? error : undefined }
    );
  }
}

function resolveConfigPaths(config: SimpliConfig, rootDir: string): SimpliConfig {
  return {
    ...config,
    docsDir: path.resolve(rootDir, config.docsDir ?? 'docs'),
    pagesDir: path.resolve(rootDir, config.pagesDir ?? 'src/pages'),
    staticDir: path.resolve(rootDir, config.staticDir ?? 'static'),
    build: {
      ...config.build,
      outDir: path.resolve(rootDir, config.build?.outDir ?? 'dist'),
    },
  };
}

export function serializeConfig(config: SimpliConfig): string {
  const serializable = JSON.parse(JSON.stringify(config));
  return `export default ${JSON.stringify(serializable, null, 2)};`;
}

export function getConfigMeta(rootDir: string): {
  exists: boolean;
  path: string | null;
  cached: boolean;
} {
  const configPath = discoverConfigFile(rootDir);
  
  return {
    exists: configPath !== null,
    path: configPath,
    cached: configPath ? configCache.has(configPath) : false,
  };
}
