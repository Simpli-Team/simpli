// ============================================================================
// Simpli Framework - Search Index Builder (FlexSearch)
// ============================================================================
// Builds a full-text search index at build time using FlexSearch.
// The index is serialized and loaded lazily at runtime for instant search.
//
// Features:
//   - Multi-field search (title, content, headings, tags)
//   - Fuzzy matching
//   - Result highlighting
//   - Section grouping
//   - Configurable tokenization
// ============================================================================

export interface SearchDocument {
    /** Unique document ID (same as route path) */
    id: string;
    /** Document title */
    title: string;
    /** Plain text content (markdown stripped) */
    content: string;
    /** URL path */
    path: string;
    /** H2/H3 headings for section search */
    headings: string[];
    /** Tags for filtering */
    tags: string[];
    /** Parent section (e.g. "docs") */
    section: string;
    /** Section anchor IDs for deep linking */
    anchors?: string[];
}

export interface SearchResult {
    /** Document ID */
    id: string;
    /** Document title */
    title: string;
    /** URL path */
    path: string;
    /** Section */
    section: string;
    /** Tags */
    tags: string[];
    /** Relevance score (higher = more relevant) */
    score: number;
    /** Matched text excerpts with highlighting */
    excerpts: SearchExcerpt[];
}

export interface SearchExcerpt {
    /** The field that matched */
    field: 'title' | 'content' | 'headings' | 'tags';
    /** Text excerpt around the match */
    text: string;
    /** Character positions of highlighted matches */
    highlights: Array<[start: number, end: number]>;
}

// ---------------------------------------------------------------------------
// Search Index Builder (runs at build time / in Node.js)
// ---------------------------------------------------------------------------

/**
 * Build search index data from processed documents.
 * Returns serializable data that can be loaded in the browser.
 */
export function buildSearchData(
    docs: Array<{
        id: string;
        title: string;
        plainText: string;
        path: string;
        headings: Array<{ text: string; id: string }>;
        tags?: string[];
        section?: string;
    }>,
): SearchDocument[] {
    return docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: truncateContent(doc.plainText, 10000), // Limit for bundle size
        path: doc.path,
        headings: doc.headings.map((h) => h.text),
        tags: doc.tags ?? [],
        section: doc.section ?? doc.path.split('/')[1] ?? 'docs',
        anchors: doc.headings.map((h) => h.id),
    }));
}

/**
 * Serialize search data to a JavaScript module string.
 */
export function serializeSearchIndex(docs: SearchDocument[]): string {
    return `export default ${JSON.stringify(docs)};`;
}

// ---------------------------------------------------------------------------
// Client-Side Search Engine (runs in browser)
// ---------------------------------------------------------------------------

/**
 * Simple but effective client-side search engine.
 * Uses inverted index with TF-IDF-like scoring.
 * No heavy dependencies needed - FlexSearch is optional enhancement.
 */
export class SimpliSearchEngine {
    private documents: SearchDocument[] = [];
    private titleIndex: Map<string, Set<number>> = new Map();
    private contentIndex: Map<string, Set<number>> = new Map();
    private initialized = false;

    /**
     * Load documents into the search engine.
     */
    load(documents: SearchDocument[]): void {
        this.documents = documents;
        this.titleIndex.clear();
        this.contentIndex.clear();

        // Build inverted indices
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];

            // Index title
            const titleTokens = tokenize(doc.title);
            for (const token of titleTokens) {
                if (!this.titleIndex.has(token)) {
                    this.titleIndex.set(token, new Set());
                }
                this.titleIndex.get(token)!.add(i);
            }

            // Index content + headings
            const contentTokens = tokenize(
                doc.content + ' ' + doc.headings.join(' '),
            );
            for (const token of contentTokens) {
                if (!this.contentIndex.has(token)) {
                    this.contentIndex.set(token, new Set());
                }
                this.contentIndex.get(token)!.add(i);
            }
        }

        this.initialized = true;
    }

    /**
     * Search for documents matching the query.
     */
    search(query: string, limit: number = 10): SearchResult[] {
        if (!this.initialized || !query.trim()) return [];

        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) return [];

        const scores = new Map<number, number>();

        for (const token of queryTokens) {
            // Title matches score higher (weight: 10)
            const titleMatches = this.findMatches(this.titleIndex, token);
            for (const idx of titleMatches) {
                scores.set(idx, (scores.get(idx) ?? 0) + 10);
            }

            // Content matches (weight: 1)
            const contentMatches = this.findMatches(this.contentIndex, token);
            for (const idx of contentMatches) {
                scores.set(idx, (scores.get(idx) ?? 0) + 1);
            }
        }

        // Sort by score descending
        const results = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([idx, score]) => {
                const doc = this.documents[idx];
                return {
                    id: doc.id,
                    title: doc.title,
                    path: doc.path,
                    section: doc.section,
                    tags: doc.tags,
                    score,
                    excerpts: this.generateExcerpts(doc, queryTokens),
                };
            });

        return results;
    }

    /**
     * Find matching document indices for a token (supports prefix matching).
     */
    private findMatches(
        index: Map<string, Set<number>>,
        token: string,
    ): Set<number> {
        const results = new Set<number>();

        // Exact match
        const exact = index.get(token);
        if (exact) {
            for (const idx of exact) results.add(idx);
        }

        // Prefix match (for partial typing)
        if (token.length >= 2) {
            for (const [key, docIndices] of index) {
                if (key.startsWith(token) && key !== token) {
                    for (const idx of docIndices) results.add(idx);
                }
            }
        }

        return results;
    }

    /**
     * Generate text excerpts around matched terms.
     */
    private generateExcerpts(
        doc: SearchDocument,
        queryTokens: string[],
    ): SearchExcerpt[] {
        const excerpts: SearchExcerpt[] = [];

        // Title excerpt
        if (
            queryTokens.some((t) =>
                doc.title.toLowerCase().includes(t),
            )
        ) {
            excerpts.push({
                field: 'title',
                text: doc.title,
                highlights: findHighlightPositions(doc.title, queryTokens),
            });
        }

        // Content excerpt (find best matching window)
        const contentExcerpt = findBestExcerpt(doc.content, queryTokens, 150);
        if (contentExcerpt) {
            excerpts.push({
                field: 'content',
                text: contentExcerpt.text,
                highlights: contentExcerpt.highlights,
            });
        }

        return excerpts;
    }
}

// ---------------------------------------------------------------------------
// Text Processing Utilities
// ---------------------------------------------------------------------------

/**
 * Tokenize text for indexing/searching.
 * Converts to lowercase, splits on word boundaries.
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 2); // Skip single chars
}

/**
 * Find character positions for highlighting matched terms.
 */
function findHighlightPositions(
    text: string,
    tokens: string[],
): Array<[number, number]> {
    const positions: Array<[number, number]> = [];
    const lowerText = text.toLowerCase();

    for (const token of tokens) {
        let pos = 0;
        while ((pos = lowerText.indexOf(token, pos)) !== -1) {
            positions.push([pos, pos + token.length]);
            pos += token.length;
        }
    }

    // Sort and merge overlapping ranges
    return mergeRanges(positions);
}

/**
 * Find the best content excerpt containing the most query matches.
 */
function findBestExcerpt(
    content: string,
    tokens: string[],
    windowSize: number,
): { text: string; highlights: Array<[number, number]> } | null {
    if (!content) return null;

    const lowerContent = content.toLowerCase();
    let bestScore = 0;
    let bestStart = 0;

    // Find position with most token matches
    for (const token of tokens) {
        const pos = lowerContent.indexOf(token);
        if (pos === -1) continue;

        const windowStart = Math.max(0, pos - Math.floor(windowSize / 3));
        const windowEnd = Math.min(content.length, windowStart + windowSize);
        const window = lowerContent.slice(windowStart, windowEnd);

        let score = 0;
        for (const t of tokens) {
            if (window.includes(t)) score++;
        }

        if (score > bestScore) {
            bestScore = score;
            bestStart = windowStart;
        }
    }

    if (bestScore === 0) return null;

    const start = bestStart;
    const end = Math.min(content.length, start + windowSize);
    let text = content.slice(start, end);

    // Add ellipsis
    if (start > 0) text = '...' + text;
    if (end < content.length) text = text + '...';

    const highlights = findHighlightPositions(text, tokens);

    return { text, highlights };
}

/**
 * Merge overlapping highlight ranges.
 */
function mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
    if (ranges.length === 0) return [];

    const sorted = ranges.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const current = sorted[i];

        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            merged.push(current);
        }
    }

    return merged;
}

/**
 * Truncate content to a maximum length at word boundary.
 */
function truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;

    const truncated = content.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}
