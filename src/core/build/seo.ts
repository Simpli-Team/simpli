// ============================================================================
// Simpli Framework - SEO & Sitemap Generator
// ============================================================================
// Generates:
//   - XML Sitemap (for search engine crawlers)
//   - robots.txt (crawler directives)
//   - Meta tag injection (Open Graph, Twitter Cards, JSON-LD)
//   - Canonical URL generation
//
// Runs as a postBuild plugin hook.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type { SimpliConfig, DocMetadata, BlogPostMetadata } from '../config/types';

// ---------------------------------------------------------------------------
// Sitemap Generation
// ---------------------------------------------------------------------------

interface SitemapEntry {
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

/**
 * Generate sitemap.xml content from routes.
 */
export function generateSitemap(
    config: SimpliConfig,
    docs: DocMetadata[],
    blogPosts: BlogPostMetadata[] = [],
): string {
    const baseUrl = (config.url ?? 'https://localhost').replace(/\/$/, '');
    const baseUrlPath = config.baseUrl ?? '/';

    const entries: SitemapEntry[] = [];

    // Homepage
    entries.push({
        url: `${baseUrl}${baseUrlPath}`,
        changefreq: 'weekly',
        priority: 1.0,
    });

    // Doc pages
    for (const doc of docs) {
        if (doc.draft || doc.unlisted) continue;

        entries.push({
            url: `${baseUrl}${doc.permalink}`,
            lastmod: doc.lastUpdate?.date,
            changefreq: 'weekly',
            priority: 0.8,
        });
    }

    // Blog posts
    for (const post of blogPosts) {
        if (post.draft) continue;

        entries.push({
            url: `${baseUrl}${post.permalink}`,
            lastmod: post.date,
            changefreq: 'monthly',
            priority: 0.6,
        });
    }

    // Build XML
    const urlEntries = entries
        .map((entry) => {
            let xml = `  <url>\n`;
            xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
            if (entry.lastmod) {
                xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
            }
            if (entry.changefreq) {
                xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
            }
            if (entry.priority !== undefined) {
                xml += `    <priority>${entry.priority}</priority>\n`;
            }
            xml += `  </url>`;
            return xml;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// robots.txt Generation
// ---------------------------------------------------------------------------

/**
 * Generate robots.txt content.
 */
export function generateRobotsTxt(config: SimpliConfig): string {
    const baseUrl = (config.url ?? 'https://localhost').replace(/\/$/, '');
    const baseUrlPath = config.baseUrl ?? '/';
    const noIndex = config.build?.noIndex ?? false;

    if (noIndex) {
        return `User-agent: *\nDisallow: /\n`;
    }

    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}${baseUrlPath}sitemap.xml
`;
}

// ---------------------------------------------------------------------------
// Meta Tag Generation
// ---------------------------------------------------------------------------

export interface PageMetaTags {
    title: string;
    description?: string;
    image?: string;
    url: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
    tags?: string[];
    siteName?: string;
}

/**
 * Generate meta tags for a page (Open Graph, Twitter Cards, etc.).
 * Returns an array of meta tag objects for injection into <head>.
 */
export function generateMetaTags(page: PageMetaTags): Array<{
    name?: string;
    property?: string;
    content: string;
}> {
    const tags: Array<{ name?: string; property?: string; content: string }> = [];

    // Basic meta
    if (page.description) {
        tags.push({ name: 'description', content: page.description });
    }

    // Open Graph
    tags.push({ property: 'og:title', content: page.title });
    tags.push({ property: 'og:type', content: page.type ?? 'website' });
    tags.push({ property: 'og:url', content: page.url });

    if (page.description) {
        tags.push({ property: 'og:description', content: page.description });
    }
    if (page.image) {
        tags.push({ property: 'og:image', content: page.image });
    }
    if (page.siteName) {
        tags.push({ property: 'og:site_name', content: page.siteName });
    }

    // Article-specific OG
    if (page.type === 'article') {
        if (page.publishedTime) {
            tags.push({
                property: 'article:published_time',
                content: page.publishedTime,
            });
        }
        if (page.author) {
            tags.push({ property: 'article:author', content: page.author });
        }
        if (page.tags) {
            for (const tag of page.tags) {
                tags.push({ property: 'article:tag', content: tag });
            }
        }
    }

    // Twitter Cards
    tags.push({
        name: 'twitter:card',
        content: page.image ? 'summary_large_image' : 'summary',
    });
    tags.push({ name: 'twitter:title', content: page.title });
    if (page.description) {
        tags.push({ name: 'twitter:description', content: page.description });
    }
    if (page.image) {
        tags.push({ name: 'twitter:image', content: page.image });
    }

    return tags;
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data
// ---------------------------------------------------------------------------

/**
 * Generate JSON-LD structured data for a documentation page.
 */
export function generateJsonLd(
    config: SimpliConfig,
    page: {
        title: string;
        description?: string;
        url: string;
        datePublished?: string;
        dateModified?: string;
        author?: string;
    },
): string {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: page.title,
        description: page.description,
        url: page.url,
        ...(page.datePublished && { datePublished: page.datePublished }),
        ...(page.dateModified && { dateModified: page.dateModified }),
        ...(page.author && {
            author: {
                '@type': 'Person',
                name: page.author,
            },
        }),
        publisher: {
            '@type': 'Organization',
            name: config.organizationName ?? config.title,
            ...(config.favicon && {
                logo: {
                    '@type': 'ImageObject',
                    url: `${config.url}${config.favicon}`,
                },
            }),
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': page.url,
        },
    };

    return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

// ---------------------------------------------------------------------------
// Post-Build Writer
// ---------------------------------------------------------------------------

/**
 * Write sitemap.xml and robots.txt to the build output directory.
 * This is called as part of the postBuild plugin hook.
 */
export function writeSeoFiles(
    outDir: string,
    config: SimpliConfig,
    docs: DocMetadata[],
    blogPosts: BlogPostMetadata[] = [],
): void {
    // sitemap.xml
    const sitemapContent = generateSitemap(config, docs, blogPosts);
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapContent, 'utf-8');

    // robots.txt
    const robotsContent = generateRobotsTxt(config);
    fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsContent, 'utf-8');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
