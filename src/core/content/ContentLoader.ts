// ============================================================================
// Simpli Framework - Content Loader
// ============================================================================
// Responsible for discovering, reading, and processing content files.
// Orchestrates the full pipeline: discover → parse → transform → index
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import {
    parseFrontmatter,
    frontmatterToMetadata,
    extractHeadings,
    stripMarkdown,
} from './FrontmatterParser';
import type { DocMetadata, BlogPostMetadata } from '../config/types';

export interface ContentCollection {
    docs: ProcessedDoc[];
    blog: ProcessedBlogPost[];
}

export interface ProcessedDoc {
    /** Unique document ID (relative path without extension) */
    id: string;
    /** Full metadata */
    metadata: DocMetadata;
    /** Raw MDX content (without frontmatter) */
    content: string;
    /** Extracted headings for TOC */
    headings: Array<{ id: string; text: string; level: number }>;
    /** Plain text for search indexing */
    plainText: string;
    /** Absolute file path */
    filePath: string;
}

export interface ProcessedBlogPost {
    id: string;
    metadata: BlogPostMetadata;
    content: string;
    headings: Array<{ id: string; text: string; level: number }>;
    plainText: string;
    filePath: string;
}

// ---------------------------------------------------------------------------
// Content Discovery
// ---------------------------------------------------------------------------

/**
 * Discover all content files in a directory.
 */
export function discoverContentFiles(
    dir: string,
    extensions: string[] = ['.mdx', '.md'],
): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];

    function walk(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }
                walk(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (extensions.includes(ext) && !entry.name.startsWith('_')) {
                    files.push(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files.sort();
}

// ---------------------------------------------------------------------------
// Document Processing
// ---------------------------------------------------------------------------

/**
 * Process a single documentation file.
 */
export function processDocFile(
    filePath: string,
    docsDir: string,
    basePath: string = '/docs',
): ProcessedDoc {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content } = parseFrontmatter(rawContent);

    // Generate document ID from relative path
    const relativePath = path.relative(docsDir, filePath);
    const ext = path.extname(relativePath);
    const id = relativePath
        .slice(0, -ext.length)
        .replace(/\\/g, '/')
        .replace(/\/index$/, '');

    // Generate default slug from path
    const defaultSlug = id
        .split('/')
        .map((segment) => {
            // Strip numeric prefix: 01-intro → intro
            const match = segment.match(/^\d+-(.+)$/);
            return match ? match[1] : segment;
        })
        .join('/');

    // Build metadata
    const partialMeta = frontmatterToMetadata(frontmatter, filePath, defaultSlug);
    const permalink = `${basePath}/${partialMeta.slug}`.replace(/\/+/g, '/');

    const metadata: DocMetadata = {
        id,
        title: partialMeta.title ?? id,
        description: partialMeta.description,
        slug: partialMeta.slug ?? defaultSlug,
        permalink,
        sidebarLabel: partialMeta.sidebarLabel,
        sidebarPosition: partialMeta.sidebarPosition,
        tags: partialMeta.tags,
        keywords: partialMeta.keywords,
        image: partialMeta.image,
        hideTitle: partialMeta.hideTitle ?? false,
        hideTableOfContents: partialMeta.hideTableOfContents ?? false,
        draft: partialMeta.draft ?? false,
        unlisted: partialMeta.unlisted ?? false,
        paginationPrev: partialMeta.paginationPrev ?? undefined,
        paginationNext: partialMeta.paginationNext ?? undefined,
        customEditUrl: partialMeta.customEditUrl,
        lastUpdate: partialMeta.lastUpdate,
        source: filePath.replace(/\\/g, '/'),
        contentPath: filePath.replace(/\\/g, '/'),
    };

    // Extract headings and plain text
    const headings = extractHeadings(content);
    const plainText = stripMarkdown(content);

    return {
        id,
        metadata,
        content,
        headings,
        plainText,
        filePath: filePath.replace(/\\/g, '/'),
    };
}

/**
 * Process a blog post file.
 */
export function processBlogFile(
    filePath: string,
    blogDir: string,
    basePath: string = '/blog',
): ProcessedBlogPost {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content } = parseFrontmatter(rawContent);

    const relativePath = path.relative(blogDir, filePath);
    const ext = path.extname(relativePath);
    const id = relativePath.slice(0, -ext.length).replace(/\\/g, '/');

    // Extract date from filename or frontmatter
    const dateMatch = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})/);
    const date =
        (frontmatter.date as string) ??
        dateMatch?.[1] ??
        new Date().toISOString().slice(0, 10);

    // Generate slug
    const slug = (frontmatter.slug as string) ??
        id.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
    const permalink = `${basePath}/${slug}`;

    // Estimate reading time (~200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const metadata: BlogPostMetadata = {
        id,
        title: (frontmatter.title as string) ?? slug,
        description: frontmatter.description as string | undefined,
        slug,
        permalink,
        date,
        authors: frontmatter.authors as BlogPostMetadata['authors'],
        tags: frontmatter.tags,
        image: frontmatter.image as string | undefined,
        draft: frontmatter.draft ?? false,
        readingTime,
        source: filePath.replace(/\\/g, '/'),
    };

    const headings = extractHeadings(content);
    const plainText = stripMarkdown(content);

    return {
        id,
        metadata,
        content,
        headings,
        plainText,
        filePath: filePath.replace(/\\/g, '/'),
    };
}

// ---------------------------------------------------------------------------
// Bulk Loading
// ---------------------------------------------------------------------------

/**
 * Load all content from docs and blog directories.
 */
export function loadAllContent(
    docsDir: string,
    blogDir: string,
): ContentCollection {
    const docFiles = discoverContentFiles(docsDir);
    const blogFiles = discoverContentFiles(blogDir);

    const docs = docFiles
        .map((f) => processDocFile(f, docsDir))
        .filter((d) => !d.metadata.draft);

    const blog = blogFiles
        .map((f) => processBlogFile(f, blogDir))
        .filter((b) => !b.metadata.draft)
        .sort((a, b) => b.metadata.date.localeCompare(a.metadata.date)); // Newest first

    return { docs, blog };
}
