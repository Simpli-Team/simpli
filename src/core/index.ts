// ============================================================================
// Simpli Framework - Core Public API
// ============================================================================
// This is the main entry point for all core framework functionality.
// ============================================================================

// Config
export { defineConfig } from './defineConfig';
export { loadConfig, serializeConfig, mergeWithDefaults, DEFAULT_CONFIG } from './config';
export type {
    SimpliConfig,
    SimpliUserConfig,
    ThemeConfig,
    NavbarConfig,
    NavbarItem,
    FooterConfig,
    SidebarItem,
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
} from './config';

// Router
export { RadixRouter, generateRoutes, toRouteConfigs } from './router';
export type { RouteMatch, GeneratedRoute, RouteGeneratorOptions } from './router';

// Plugin System
export { PluginManager, getPluginManager, HookRegistry } from './plugin';
export type { HookType } from './plugin';

// Content Pipeline
export {
    parseFrontmatter,
    extractHeadings,
    stripMarkdown,
    discoverContentFiles,
    processDocFile,
    processBlogFile,
    loadAllContent,
    buildSearchData,
    SimpliSearchEngine,
} from './content';
export type {
    ParsedContent,
    DocumentFrontmatter,
    ContentCollection,
    ProcessedDoc,
    SearchDocument,
    SearchResult,
} from './content';

// Vite Plugin
export { simpliPlugin } from './vite/plugin';
export type { SimpliVitePluginOptions } from './vite/plugin';

// State
export {
    useStore,
    useTheme,
    useSidebar,
    useSearch,
    useToc,
} from './state/store';
export type { SimpliStore, TOCHeading } from './state/store';

// Build & SEO
export {
    generateSitemap,
    generateRobotsTxt,
    generateMetaTags,
    generateJsonLd,
    writeSeoFiles,
    ContentCache,
} from './build';
export type { PageMetaTags } from './build';

// Sidebar Generator
export { generateSidebar } from './content';

// Syntax Highlighting
export { highlight, highlightBatch, processMagicComments } from './content/ShikiHighlighter';
export type { HighlightOptions, HighlightResult } from './content/ShikiHighlighter';
