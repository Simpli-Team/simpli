import type { SimpliPluginInstance, DocMetadata } from '../../core/config/types.js';

interface SearchDoc {
  id: string;
  title: string;
  content: string;
  path: string;
  headings: string[];
  tags: string[];
  section: string;
}

interface ContentDoc {
  id: string;
  metadata?: DocMetadata & { permalink?: string };
  plainText?: string;
  headings?: { text: string }[];
}

export interface SearchLocalPluginOptions {
  /** Index docs content */
  indexDocs?: boolean;
  /** Index pages */
  indexPages?: boolean;
  /** Max search results */
  maxResults?: number;
  /** Highlight search terms */
  highlightSearchTerms?: boolean;
}

export function searchLocalPlugin(options: SearchLocalPluginOptions = {}): SimpliPluginInstance {
  const {
    indexDocs = true,
    indexPages = false,
    maxResults = 10,
    highlightSearchTerms = true,
  } = options;

  return {
    name: '@simpli/plugin-search-local',

    configLoaded(config) {
      if (!config.themeConfig?.search) {
        if (!config.themeConfig) config.themeConfig = {};
        config.themeConfig.search = {
          enabled: true,
          provider: 'local',
          local: {
            indexDocs,
            indexPages,
            highlightSearchTerms,
            maxResults,
          },
        };
      }
      return config;
    },

    async contentLoaded({ content, createData }) {
      console.log('[search-local] Building search index...');
      
      const searchDocs: SearchDoc[] = [];
      
      if (indexDocs && content.docs) {
        const docs = content.docs as ContentDoc[];
        const mappedDocs: SearchDoc[] = docs.map((doc) => ({
          id: doc.id,
          title: doc.metadata?.title ?? '',
          content: doc.plainText ?? '',
          path: doc.metadata?.permalink ?? '',
          headings: (doc.headings ?? []).map((h) => h.text),
          tags: doc.metadata?.tags || [],
          section: 'docs',
        }));
        searchDocs.push(...mappedDocs);
      }

      await createData('search-index.json', JSON.stringify(searchDocs));
    },
  };
}

export default searchLocalPlugin;
