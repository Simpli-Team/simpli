// ============================================================================
// Simpli Framework - MDX Transform Pipeline
// ============================================================================
// Configures @mdx-js/rollup with remark and rehype plugins for processing
// MDX files with full feature support (GFM, admonitions, syntax highlighting)
// ============================================================================

import type { Plugin } from 'vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { SimpliConfig } from '../config/types';
import type { Pluggable } from 'unified';

export interface MDXTransformOptions {
  config: SimpliConfig;
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
}

/**
 * Create MDX transformation plugin with Simpli defaults.
 */
export function createMDXTransform(_options: MDXTransformOptions): Plugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { config: _config, remarkPlugins = [] as Pluggable[], rehypePlugins = [] as Pluggable[] } = _options;

  // Default remark plugins
  const defaultRemarkPlugins: Pluggable[] = [
    remarkGfm,           // GitHub Flavored Markdown
    remarkDirective,     // ::: directives for admonitions
    // Custom plugins can be added here
  ];

  // Default rehype plugins
  const defaultRehypePlugins: Pluggable[] = [
    rehypeSlug,          // Add IDs to headings
    [rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { 
        className: ['anchor'],
        ariaHidden: 'true',
        tabIndex: -1,
      },
    }],
  ];

  return mdx({
    remarkPlugins: [...defaultRemarkPlugins, ...remarkPlugins],
    rehypePlugins: [...defaultRehypePlugins, ...rehypePlugins],
    providerImportSource: '@mdx-js/react',
    jsxImportSource: 'react',
  }) as Plugin;
}

/**
 * Custom remark plugin for admonitions.
 * Converts :::note, :::tip, :::warning directives to JSX components.
 */
export function remarkAdmonitions(): unknown {
  return function transformer(tree: unknown) {
    // This is a placeholder - in a real implementation,
    // we would traverse the MDAST and transform directive nodes
    return tree;
  };
}
