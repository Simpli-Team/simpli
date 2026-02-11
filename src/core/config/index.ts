// ============================================================================
// Simpli Framework - Config Module Public API
// ============================================================================

// Types
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
  BlogPostMetadata,
  RouteConfig,
  SimpliPluginInstance,
  ContentLoadedArgs,
  PostBuildArgs,
} from './types';

// Config loading
export { loadConfig, serializeConfig, discoverConfigFile } from './loader';

// Defaults
export { DEFAULT_CONFIG, mergeWithDefaults } from './defaults';
