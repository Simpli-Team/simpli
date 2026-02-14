// ============================================================================
// Simpli Framework - Content Pipeline Public API
// ============================================================================

export {
  discoverContentFiles,
  processDocFile,
  loadAllContent,
} from './ContentLoader.js';

export type {
  ProcessedDoc,
  ContentCollection,
} from './ContentLoader.js';

export { SimpliSearchEngine, buildSearchData } from './SearchIndex.js';
export type { SearchDocument, SearchResult } from './SearchIndex.js';

export { generateSidebar } from './SidebarGenerator.js';

export {
  parseFrontmatter,
  frontmatterToMetadata,
} from './FrontmatterParser.js';

// Re-export types from config/types
export type { SidebarItem, SidebarCategoryItem } from '../config/types.js';
