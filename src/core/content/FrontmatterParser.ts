// ============================================================================
// Simpli Framework - Frontmatter Parser
// ============================================================================
// Wraps gray-matter for parsing YAML frontmatter from MDX/MD files.
// Provides type-safe extraction and validation of document metadata.
// ============================================================================

import matter from 'gray-matter';
import type { DocMetadata } from '../config/types';

export interface ParsedContent {
    /** Parsed frontmatter data */
    frontmatter: DocumentFrontmatter;
    /** Content without frontmatter */
    content: string;
    /** Raw frontmatter string */
    rawFrontmatter: string;
}

export interface DocumentFrontmatter {
    title?: string;
    description?: string;
    sidebar_label?: string;
    sidebar_position?: number;
    slug?: string;
    tags?: string[];
    keywords?: string[];
    image?: string;
    hide_title?: boolean;
    hide_table_of_contents?: boolean;
    draft?: boolean;
    unlisted?: boolean;
    pagination_prev?: string | null;
    pagination_next?: string | null;
    custom_edit_url?: string;
    last_update?: {
        date: string;
        author?: string;
    };
    // Allow custom fields
    [key: string]: unknown;
}

/**
 * Parse frontmatter from a markdown/MDX string.
 */
export function parseFrontmatter(source: string): ParsedContent {
    const { data, content, matter: rawFm } = matter(source);

    return {
        frontmatter: data as DocumentFrontmatter,
        content,
        rawFrontmatter: rawFm,
    };
}

/**
 * Convert parsed frontmatter to DocMetadata format.
 */
export function frontmatterToMetadata(
    frontmatter: DocumentFrontmatter,
    filePath: string,
    defaultSlug: string,
): Partial<DocMetadata> {
    const slug = frontmatter.slug ?? defaultSlug;

    return {
        title: frontmatter.title ?? slugToTitle(defaultSlug),
        description: frontmatter.description,
        slug,
        sidebarLabel: frontmatter.sidebar_label,
        sidebarPosition: frontmatter.sidebar_position,
        tags: frontmatter.tags,
        keywords: frontmatter.keywords,
        image: frontmatter.image,
        hideTitle: frontmatter.hide_title ?? false,
        hideTableOfContents: frontmatter.hide_table_of_contents ?? false,
        draft: frontmatter.draft ?? false,
        unlisted: frontmatter.unlisted ?? false,
        paginationPrev: frontmatter.pagination_prev,
        paginationNext: frontmatter.pagination_next,
        customEditUrl: frontmatter.custom_edit_url,
        lastUpdate: frontmatter.last_update,
        source: filePath,
        contentPath: filePath,
    };
}

/**
 * Extract headings (H1-H6) from markdown content.
 * Used for TOC generation and search indexing.
 */
export function extractHeadings(
    content: string,
): Array<{ id: string; text: string; level: number }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{ id: string; text: string; level: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2]
            .replace(/\*\*(.+?)\*\*/g, '$1') // Strip bold
            .replace(/\*(.+?)\*/g, '$1') // Strip italic
            .replace(/`(.+?)`/g, '$1') // Strip inline code
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Strip links
            .trim();

        const id = textToSlug(text);
        headings.push({ id, text, level });
    }

    return headings;
}

/**
 * Strip markdown formatting to get plain text (for search indexing).
 */
export function stripMarkdown(content: string): string {
    return (
        content
            // Remove code blocks
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]+`/g, '')
            // Remove HTML tags
            .replace(/<[^>]+>/g, '')
            // Remove images
            .replace(/!\[.*?\]\(.*?\)/g, '')
            // Remove links but keep text
            .replace(/\[(.+?)\]\(.*?\)/g, '$1')
            // Remove emphasis markers
            .replace(/[*_~]{1,3}/g, '')
            // Remove headings markers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove blockquotes
            .replace(/^>\s+/gm, '')
            // Remove horizontal rules
            .replace(/^[-*_]{3,}$/gm, '')
            // Remove list markers
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // Remove admonition markers
            .replace(/^:::\w+.*$/gm, '')
            .replace(/^:::$/gm, '')
            // Remove import/export statements
            .replace(/^(import|export)\s+.*$/gm, '')
            // Collapse whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugToTitle(slug: string): string {
    return slug
        .split('/')
        .pop()!
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function textToSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
