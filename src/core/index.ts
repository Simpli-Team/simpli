// ============================================================================
// Simpli Framework - Core Public API (Production Level)
// ============================================================================

export { defineConfig, defineThemeConfig } from './defineConfig.js';
export { 
  loadConfig, 
  loadConfigSync,
  serializeConfig, 
  mergeWithDefaults, 
  DEFAULT_CONFIG,
  discoverConfigFile,
  clearConfigCache,
  getConfigMeta,
} from './config/index.js';

export type {
  SimpliConfig,
  SimpliUserConfig,
  ThemeConfig,
  NavbarConfig,
  NavbarItem,
  FooterConfig,
  SidebarItem,
  SidebarCategoryItem,
  SidebarsConfig,
  ColorMode,
  ColorModeConfig,
  SearchConfig,
  MarkdownConfig,
  I18nConfig,
  VersioningConfig,
  BuildConfig,
  PluginConfig,
  DocMetadata,
  RouteConfig,
  SimpliPluginInstance,
  ContentLoadedArgs,
  PostBuildArgs,
} from './config/types.js';

export {
  SimpliError,
  ConfigError,
  ContentError,
  BuildError,
  PluginError,
  RouterError,
  ValidationError,
  ErrorCodes,
  handleError,
  tryCatch,
  tryCatchSync,
} from './errors/index.js';

export {
  ConfigValidator,
  configValidator,
  validateConfig,
  isValidConfig,
} from './validators/index.js';

export { RadixRouter, generateRoutes, toRouteConfigs } from './router/index.js';
export type { RouteMatch, GeneratedRoute, RouteGeneratorOptions } from './router/index.js';

export { PluginManager, getPluginManager, HookRegistry } from './plugin/index.js';
export type { HookType } from './plugin/index.js';

export {
  discoverContentFiles,
  processDocFile,
  loadAllContent,
  buildSearchData,
  SimpliSearchEngine,
} from './content/index.js';
export type {
  ProcessedDoc,
  ContentCollection,
  SearchDocument,
  SearchResult,
} from './content/index.js';

export { simpliPlugin } from './vite/plugin.js';
export type { SimpliVitePluginOptions } from './vite/plugin.js';
export { createMDXTransform } from './vite/mdxTransform.js';
export type { MDXTransformOptions } from './vite/mdxTransform.js';

export {
  useStore,
  useTheme,
  useSidebar,
  useSearch,
  useToc,
} from './state/store.js';
export type { SimpliStore, TOCHeading } from './state/store.js';

export {
  generateSitemap,
  generateRobotsTxt,
  generateMetaTags,
  generateJsonLd,
  writeSeoFiles,
} from './build/index.js';
export type { PageMetaTags } from './build/index.js';

export { generateSidebar } from './content/SidebarGenerator.js';

export { highlight, highlightBatch, processMagicComments } from './content/ShikiHighlighter.js';
export type { HighlightOptions, HighlightResult } from './content/ShikiHighlighter.js';

export const version = '0.1.0';
