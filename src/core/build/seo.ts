// ============================================================================
// Simpli Framework - SEO & Sitemap Generator
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type { SimpliConfig, DocMetadata } from '../config/types.js';

interface SitemapEntry {
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export function generateSitemap(
    config: SimpliConfig,
    docs: DocMetadata[],
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

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export interface RobotsConfig {
    allow?: string[];
    disallow?: string[];
    sitemap?: string;
}

export function generateRobotsTxt(
    config: SimpliConfig,
    options: RobotsConfig = {},
): string {
    const { allow = [], disallow = [], sitemap } = options;
    
    let content = 'User-agent: *\n';
    
    for (const path of allow) {
        content += `Allow: ${path}\n`;
    }
    
    for (const path of disallow) {
        content += `Disallow: ${path}\n`;
    }
    
    const sitemapUrl = sitemap ?? `${config.url ?? ''}${config.baseUrl ?? '/'}sitemap.xml`;
    content += `\nSitemap: ${sitemapUrl}\n`;
    
    return content;
}

export interface PageMetaTags {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    twitterCard?: 'summary' | 'summary_large_image';
}

export function generateMetaTags(meta: PageMetaTags): string {
    const tags: string[] = [];
    
    // Basic
    tags.push(`<title>${escapeHtml(meta.title)}</title>`);
    if (meta.description) {
        tags.push(`<meta name="description" content="${escapeHtml(meta.description)}">`);
    }
    
    // Open Graph
    tags.push(`<meta property="og:title" content="${escapeHtml(meta.title)}">`);
    if (meta.description) {
        tags.push(`<meta property="og:description" content="${escapeHtml(meta.description)}">`);
    }
    if (meta.url) {
        tags.push(`<meta property="og:url" content="${escapeHtml(meta.url)}">`);
    }
    tags.push(`<meta property="og:type" content="${meta.type ?? 'website'}">`);
    if (meta.image) {
        tags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}">`);
    }
    
    // Twitter
    tags.push(`<meta name="twitter:card" content="${meta.twitterCard ?? 'summary'}">`);
    tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.title)}">`);
    if (meta.description) {
        tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}">`);
    }
    if (meta.image) {
        tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.image)}">`);
    }
    
    return tags.join('\n');
}

export interface JsonLdData {
    '@context': string;
    '@type': string;
    [key: string]: unknown;
}

export function generateJsonLd(data: JsonLdData): string {
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export interface WriteSeoOptions {
    docs: DocMetadata[];
    robots?: RobotsConfig;
}

export function writeSeoFiles(
    outDir: string,
    config: SimpliConfig,
    options: WriteSeoOptions,
): void {
    const { docs, robots = {} } = options;
    
    // Write sitemap
    const sitemap = generateSitemap(config, docs);
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
    
    // Write robots.txt
    const robotsTxt = generateRobotsTxt(config, robots);
    fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt);
}
