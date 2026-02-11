import type { SimpliPluginInstance } from '../../core/config/types';

export interface ContentBlogPluginOptions {
  path?: string;
  routeBasePath?: string;
  postsPerPage?: number;
  includeDrafts?: boolean;
  feed?: boolean;
}

export function contentBlogPlugin(options: ContentBlogPluginOptions = {}): SimpliPluginInstance {
  const {
    path: blogPath = 'blog',
    feed = true,
  } = options;

  return {
    name: '@simpli/plugin-content-blog',

    configLoaded(config) {
      if (!config.blogDir) {
        config.blogDir = blogPath;
      }
      return config;
    },

    async postBuild() {
      if (feed) {
        console.log('[content-blog] Generating RSS feeds...');
      }
    },
  };
}

export default contentBlogPlugin;
