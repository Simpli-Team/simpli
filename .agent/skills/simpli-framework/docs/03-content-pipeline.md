# 📄 Content Pipeline

## MDX Processing Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  .mdx/.md   │────▶│ Frontmatter  │────▶│   Remark     │
│   files     │     │  (gray-matter)│     │  Plugins     │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                    ┌──────────────┐     ┌───────▼──────┐
                    │    React     │◀────│   Rehype     │
                    │  Component   │     │  Plugins     │
                    └──────────────┘     └──────────────┘
```

## 1. Frontmatter Schema

```typescript
interface DocFrontmatter {
  title: string;                    // Required: Page title
  description?: string;             // Meta description
  sidebar_label?: string;           // Override sidebar text
  sidebar_position?: number;        // Sort order in sidebar
  slug?: string;                    // Custom URL slug
  tags?: string[];                  // Searchable tags
  keywords?: string[];              // SEO keywords
  image?: string;                   // OG image
  hide_title?: boolean;             // Hide H1
  hide_table_of_contents?: boolean; // Hide TOC
  draft?: boolean;                  // Exclude from production
  unlisted?: boolean;               // No index, but accessible
  pagination_prev?: string | null;  // Custom prev link
  pagination_next?: string | null;  // Custom next link
  custom_edit_url?: string;         // Edit on GitHub link
  last_update?: {                   // Last modification
    date: string;
    author?: string;
  };
}
```

## 2. Remark Plugins Chain

```typescript
const remarkPlugins = [
  remarkGfm,           // Tables, strikethrough, task lists
  remarkDirective,     // :::note, :::tip, :::warning directives
  remarkAdmonitions,   // Custom: convert directives to admonition components
  remarkMath,          // (optional) LaTeX math support
  remarkToc,           // Custom: extract TOC from headings
  remarkCodeMeta,      // Custom: parse code block meta (title, highlights)
];
```

## 3. Rehype Plugins Chain

```typescript
const rehypePlugins = [
  rehypeSlug,                // Add IDs to headings
  [rehypeAutolinkHeadings, { // Add anchor links
    behavior: 'wrap',
    properties: { className: ['anchor'] }
  }],
  rehypeShiki,               // Custom: Shiki syntax highlighting
  rehypeImgSize,             // Custom: Add width/height to images
];
```

## 4. Code Block Processing (Shiki)

```typescript
// src/core/content/ShikiProcessor.ts
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['typescript', 'javascript', 'jsx', 'tsx', 'css', 
          'html', 'json', 'bash', 'python', 'rust', 'go',
          'yaml', 'markdown', 'sql', 'graphql'],
});

// Features:
// - Line highlighting: ```ts {1,3-5}
// - Line numbers: ```ts showLineNumbers
// - Title: ```ts title="config.ts"
// - Diff: ```ts // [!code ++] // [!code --]
// - Focus: ```ts // [!code focus]
// - Copy button: auto-added
// - Word highlighting: ```ts /pattern/
```

## 5. Content Index (Search)

```typescript
// src/core/content/ContentIndex.ts
import FlexSearch from 'flexsearch';

interface SearchDocument {
  id: string;
  title: string;
  content: string;    // Plain text (stripped markdown)
  headings: string[]; // H2, H3 headings
  tags: string[];
  path: string;
  section: string;    // Parent section name
}

// Build index at build time, load lazily at runtime
// Index is serialized to JSON and loaded on first search
class SearchIndex {
  private index: FlexSearch.Document<SearchDocument>;
  
  async build(docs: DocMetadata[]): Promise<void> { /* ... */ }
  async search(query: string, limit?: number): Promise<SearchResult[]> { /* ... */ }
  serialize(): string { /* ... */ }  // For SSG
  deserialize(data: string): void { /* ... */ }  // For runtime
}
```

## 6. Content Caching Strategy

```typescript
// Dev mode: File watcher + incremental rebuild
// Only reprocess changed files
// Cache compiled MDX in memory (Map<filePath, CompiledModule>)
// Invalidate on: file change, config change, plugin change

// Build mode: Parallel processing
// Process all MDX files in parallel using Promise.all
// Write compiled output to .simpli/cache/
```

## 7. Auto-Sidebar Generation

```typescript
// From file structure:
// docs/
//   ├── intro.mdx              (position: 1)
//   ├── getting-started/
//   │   ├── _category_.json    { label: "Getting Started", position: 2 }
//   │   ├── installation.mdx   (position: 1)
//   │   └── configuration.mdx  (position: 2)
//   └── guides/
//       ├── _category_.json    { label: "Guides", position: 3 }
//       └── advanced.mdx

// Generates:
const sidebar = [
  { type: 'doc', id: 'intro', label: 'Introduction' },
  { type: 'category', label: 'Getting Started', items: [
    { type: 'doc', id: 'getting-started/installation' },
    { type: 'doc', id: 'getting-started/configuration' },
  ]},
  { type: 'category', label: 'Guides', items: [
    { type: 'doc', id: 'guides/advanced' },
  ]},
];
```
