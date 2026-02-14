// ============================================================================
// Simpli Framework - Content Loader
// ============================================================================
// Responsible for discovering, reading, and processing content files.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import {
  parseFrontmatter,
  frontmatterToMetadata,
  extractHeadings,
  stripMarkdown,
} from './FrontmatterParser.js';
import type { DocMetadata } from '../config/types.js';

export interface ProcessedDoc {
  id: string;
  metadata: DocMetadata;
  content: string;
  headings: Array<{ id: string; text: string; level: number }>;
  plainText: string;
  filePath: string;
}

export interface ContentCollection {
  docs: ProcessedDoc[];
}

// ---------------------------------------------------------------------------
// Content Discovery
// ---------------------------------------------------------------------------

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

export function processDocFile(
  filePath: string,
  docsDir: string,
  basePath: string = '/docs',
): ProcessedDoc {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = parseFrontmatter(rawContent);

  const relativePath = path.relative(docsDir, filePath);
  const ext = path.extname(relativePath);
  const id = relativePath
    .slice(0, -ext.length)
    .replace(/\\/g, '/')
    .replace(/\/index$/, '');

  const defaultSlug = id
    .split('/')
    .map((segment) => {
      const match = segment.match(/^\d+-(.+)$/);
      return match ? match[1] : segment;
    })
    .join('/');

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

export function loadAllContent(docsDir: string): ContentCollection {
  const docFiles = discoverContentFiles(docsDir);

  const docs = docFiles
    .map((f) => processDocFile(f, docsDir))
    .filter((d) => !d.metadata.draft);

  return { docs };
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export {
  parseFrontmatter,
  extractHeadings,
  stripMarkdown,
} from './FrontmatterParser.js';
