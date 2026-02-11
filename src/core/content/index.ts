// ============================================================================
// Simpli Framework - Content Module Public API
// ============================================================================

export {
    parseFrontmatter,
    frontmatterToMetadata,
    extractHeadings,
    stripMarkdown,
} from './FrontmatterParser';
export type { ParsedContent, DocumentFrontmatter } from './FrontmatterParser';

export {
    discoverContentFiles,
    processDocFile,
    processBlogFile,
    loadAllContent,
} from './ContentLoader';
export type {
    ContentCollection,
    ProcessedDoc,
    ProcessedBlogPost,
} from './ContentLoader';

export {
    buildSearchData,
    serializeSearchIndex,
    SimpliSearchEngine,
} from './SearchIndex';
export type {
    SearchDocument,
    SearchResult,
    SearchExcerpt,
} from './SearchIndex';

export { generateSidebar } from './SidebarGenerator';
