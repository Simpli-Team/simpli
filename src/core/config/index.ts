// ============================================================================
// Simpli Framework - Config Module Public API
// ============================================================================

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
} from './types.js';

export { 
  loadConfig, 
  loadConfigSync,
  serializeConfig, 
  discoverConfigFile,
  clearConfigCache,
  getConfigMeta,
} from './loader.js';

export { DEFAULT_CONFIG, mergeWithDefaults } from './defaults.js';
