import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { simpliPlugin } from './src/core/vite/plugin';
import { admonitionRemarkPlugin } from './src/core/vite/remarkAdmonition';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    simpliPlugin(),
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [
          remarkFrontmatter,    // Strip frontmatter from rendered output
          remarkGfm,            // GitHub Flavored Markdown
          remarkDirective,      // Support ::: directive syntax
          admonitionRemarkPlugin, // Transform :::tip, :::warning, etc to components
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
              className: ['anchor'],
              ariaHidden: 'true',
              tabIndex: -1,
            },
          }],
        ],
      }),
    },
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@core': '/src/core',
      '@theme': '/src/theme',
      '@plugins': '/src/plugins',
    },
  },
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router': ['react-router'],
          'mdx': ['@mdx-js/react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
