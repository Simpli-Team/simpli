// ============================================================================
// Simpli Framework - Config Definition Helper
// ============================================================================
// Provides type inference for simpli.config.ts files.
// ============================================================================

import type { SimpliConfig, SimpliUserConfig } from './config/types';
import { mergeWithDefaults } from './config/defaults';

/**
 * Define a Simpli configuration with full type inference.
 * 
 * @example
 * ```ts
 * import { defineConfig } from '@simpli/core';
 * 
 * export default defineConfig({
 *   title: 'My Documentation',
 *   url: 'https://mydocs.dev',
 * });
 * ```
 */
export function defineConfig(config: SimpliUserConfig): SimpliConfig {
  return mergeWithDefaults(config);
}

/**
 * Define a partial configuration for theme-specific settings.
 */
export function defineThemeConfig(config: Partial<SimpliConfig['themeConfig']>): SimpliConfig['themeConfig'] {
  return config;
}
