// ============================================================================
// Simpli Framework - Shiki Code Highlighter
// ============================================================================
// Server-side + client-side syntax highlighting using Shiki.
// Unlike Prism.js (used by Docusaurus), Shiki uses the same grammar files
// as VS Code, providing perfect highlighting for all languages.
//
// Key design decisions:
//   - Lazy initialization (highlighter loaded on first use)
//   - Language chunking (only load languages as needed)
//   - Dual theme support (light + dark in single pass)
//   - Line highlighting via magic comments
//   - Title/language extraction from meta strings
//   - Copy button integration
// ============================================================================

import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';

export interface HighlightOptions {
    /** Source code to highlight */
    code: string;
    /** Language identifier */
    language: string;
    /** Light theme name */
    lightTheme?: string;
    /** Dark theme name */
    darkTheme?: string;
    /** Whether to add line numbers */
    showLineNumbers?: boolean;
    /** Lines to highlight (1-indexed) */
    highlightLines?: number[];
    /** Lines to mark as added (diff) */
    addedLines?: number[];
    /** Lines to mark as removed (diff) */
    removedLines?: number[];
    /** Title to display above code block */
    title?: string;
    /** Meta string from code fence (```js title="example" {1-3}) */
    metaString?: string;
}

export interface HighlightResult {
    /** HTML output with syntax highlighting */
    html: string;
    /** Language used */
    language: string;
    /** Parsed title */
    title?: string;
    /** Number of lines */
    lineCount: number;
}

// ---------------------------------------------------------------------------
// Singleton Highlighter
// ---------------------------------------------------------------------------

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;

const DEFAULT_LIGHT_THEME = 'github-light';
const DEFAULT_DARK_THEME = 'github-dark';

// Common languages to preload for faster first highlight
const PRELOAD_LANGUAGES: BundledLanguage[] = [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'html',
    'css',
    'json',
    'markdown',
    'bash',
    'yaml',
];

/**
 * Get or create the singleton Shiki highlighter.
 * Lazy-initialized on first use.
 */
async function getHighlighter(): Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> {
    if (!highlighterPromise) {
        highlighterPromise = initHighlighter();
    }
    return highlighterPromise;
}

async function initHighlighter(): Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> {
    const { createHighlighter } = await import('shiki');

    return createHighlighter({
        themes: [DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME],
        langs: PRELOAD_LANGUAGES,
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Highlight code with Shiki.
 * Returns HTML with dual-theme support (light + dark CSS variables).
 */
export async function highlight(options: HighlightOptions): Promise<HighlightResult> {
    const {
        code,
        language,
        lightTheme = DEFAULT_LIGHT_THEME,
        darkTheme = DEFAULT_DARK_THEME,
        showLineNumbers = false,
        highlightLines = [],
        addedLines = [],
        removedLines = [],
        metaString,
    } = options;

    const highlighter = await getHighlighter();

    // Parse meta string for additional options
    const meta = parseMetaString(metaString ?? '');
    const title = options.title ?? meta.title;
    const mergedHighlightLines = [
        ...highlightLines,
        ...meta.highlightLines,
    ];

    // Ensure language is loaded
    const lang = normalizeLanguage(language);
    const loadedLangs = highlighter.getLoadedLanguages();
    if (!loadedLangs.includes(lang as BundledLanguage)) {
        try {
            await highlighter.loadLanguage(lang as BundledLanguage);
        } catch {
            // Fall back to plaintext if language not available
            console.warn(`[simpli:shiki] Language "${lang}" not found, using plaintext`);
        }
    }

    // Generate HTML with dual themes using CSS variables
    const html = highlighter.codeToHtml(code.trim(), {
        lang: lang as BundledLanguage,
        themes: {
            light: lightTheme as BundledTheme,
            dark: darkTheme as BundledTheme,
        },
        defaultColor: false, // Use CSS variables for theme switching
        transformers: [
            // Line highlighting transformer
            createLineTransformer(mergedHighlightLines, addedLines, removedLines),
            // Line numbers transformer
            ...(showLineNumbers ? [createLineNumberTransformer()] : []),
        ],
    });

    const lineCount = code.trim().split('\n').length;

    return {
        html,
        language: lang,
        title,
        lineCount,
    };
}

/**
 * Highlight code synchronously (for SSR/build time).
 * Requires the highlighter to be pre-initialized.
 */
export async function highlightBatch(
    blocks: HighlightOptions[],
): Promise<HighlightResult[]> {
    // Pre-load all needed languages
    const highlighter = await getHighlighter();
    const loadedLangs = new Set(highlighter.getLoadedLanguages());
    const neededLangs = new Set<string>();

    for (const block of blocks) {
        const lang = normalizeLanguage(block.language);
        if (!loadedLangs.has(lang)) {
            neededLangs.add(lang);
        }
    }

    // Batch load languages
    for (const lang of neededLangs) {
        try {
            await highlighter.loadLanguage(lang as BundledLanguage);
        } catch {
            // Skip unavailable languages
        }
    }

    // Highlight all blocks
    return Promise.all(blocks.map((block) => highlight(block)));
}

// ---------------------------------------------------------------------------
// Meta String Parser
// ---------------------------------------------------------------------------

interface ParsedMeta {
    title?: string;
    highlightLines: number[];
    showLineNumbers: boolean;
}

/**
 * Parse code fence meta string.
 *
 * Supports:
 *   ```js title="app.js"           → title
 *   ```js {1,3-5}                  → highlight lines 1, 3, 4, 5
 *   ```js showLineNumbers          → show line numbers
 *   ```js {1,3-5} title="example"  → combined
 */
function parseMetaString(meta: string): ParsedMeta {
    const result: ParsedMeta = {
        highlightLines: [],
        showLineNumbers: false,
    };

    if (!meta) return result;

    // Extract title
    const titleMatch = meta.match(/title=["']([^"']+)["']/);
    if (titleMatch) {
        result.title = titleMatch[1];
    }

    // Extract highlighted lines: {1,3-5,7}
    const linesMatch = meta.match(/\{([\d,\s-]+)\}/);
    if (linesMatch) {
        result.highlightLines = parseLineRange(linesMatch[1]);
    }

    // Check for showLineNumbers flag
    if (meta.includes('showLineNumbers')) {
        result.showLineNumbers = true;
    }

    return result;
}

/**
 * Parse a line range string: "1,3-5,7" → [1, 3, 4, 5, 7]
 */
function parseLineRange(rangeStr: string): number[] {
    const lines: number[] = [];
    const parts = rangeStr.split(',');

    for (const part of parts) {
        const trimmed = part.trim();

        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                lines.push(i);
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) {
                lines.push(num);
            }
        }
    }

    return lines;
}

// ---------------------------------------------------------------------------
// Shiki Transformers
// ---------------------------------------------------------------------------

interface ShikiTransformer {
    line?(node: unknown, line: number): void;
}

/**
 * Create a transformer that adds CSS classes for highlighted/diff lines.
 */
function createLineTransformer(
    highlightLines: number[],
    addedLines: number[],
    removedLines: number[],
): ShikiTransformer {
    const highlightSet = new Set(highlightLines);
    const addedSet = new Set(addedLines);
    const removedSet = new Set(removedLines);

    return {
        line(node: unknown, line: number) {
            const el = node as { properties?: { class?: string } };
            if (!el.properties) return;

            const classes: string[] = [];

            if (highlightSet.has(line)) {
                classes.push('simpli-line-highlight');
            }
            if (addedSet.has(line)) {
                classes.push('simpli-line-added');
            }
            if (removedSet.has(line)) {
                classes.push('simpli-line-removed');
            }

            if (classes.length > 0) {
                el.properties.class = [el.properties.class, ...classes]
                    .filter(Boolean)
                    .join(' ');
            }
        },
    };
}

/**
 * Create a transformer that adds line number data attributes.
 */
function createLineNumberTransformer(): ShikiTransformer {
    return {
        line(node: unknown, line: number) {
            const el = node as { properties?: Record<string, unknown> };
            if (!el.properties) return;
            el.properties['data-line'] = line;
        },
    };
}

// ---------------------------------------------------------------------------
// Language Normalization
// ---------------------------------------------------------------------------

const LANGUAGE_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    mdx: 'mdx',
    plaintext: 'text',
    plain: 'text',
    txt: 'text',
    '': 'text',
};

/**
 * Normalize language identifier.
 */
function normalizeLanguage(lang: string): string {
    const lower = lang.toLowerCase().trim();
    return LANGUAGE_ALIASES[lower] ?? lower;
}

// ---------------------------------------------------------------------------
// Magic Comments Parser
// ---------------------------------------------------------------------------

export interface MagicComment {
    className: string;
    line: string;
}

const DEFAULT_MAGIC_COMMENTS: MagicComment[] = [
    { className: 'simpli-line-highlight', line: '// highlight-next-line' },
    { className: 'simpli-line-error', line: '// error-next-line' },
];

/**
 * Process magic comments in code and return highlight information.
 * Magic comments are special comments that trigger line highlighting.
 *
 * Example:
 *   // highlight-next-line
 *   const x = 1; // ← This line gets highlighted
 */
export function processMagicComments(
    code: string,
    comments: MagicComment[] = DEFAULT_MAGIC_COMMENTS,
): { code: string; highlightLines: number[]; classes: Map<number, string> } {
    const lines = code.split('\n');
    const highlightLines: number[] = [];
    const classes = new Map<number, string>();
    const filteredLines: string[] = [];
    let outputLine = 0;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        let isMagicComment = false;

        for (const comment of comments) {
            if (trimmed === comment.line) {
                // Magic comment found - highlight the NEXT line
                isMagicComment = true;
                highlightLines.push(outputLine + 1); // 1-indexed, +1 for next line
                classes.set(outputLine + 1, comment.className);
                break;
            }
        }

        if (!isMagicComment) {
            filteredLines.push(lines[i]);
            outputLine++;
        }
    }

    return {
        code: filteredLines.join('\n'),
        highlightLines,
        classes,
    };
}
