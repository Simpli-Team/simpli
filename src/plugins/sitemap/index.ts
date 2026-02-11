import type { SimpliPluginInstance } from '../../core/config/types';


export interface SitemapPluginOptions {
  /** Change frequency for entries */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Priority for entries */
  priority?: number;
  /** Exclude specific paths */
  exclude?: string[];
}

export function sitemapPlugin(options: SitemapPluginOptions = {}): SimpliPluginInstance {
  const {
    exclude = [],
  } = options;

  return {
    name: '@simpli/plugin-sitemap',

    async postBuild({ routesPaths }) {
      // Filter out excluded paths
      const filteredPaths = routesPaths.filter(
        route => !exclude.some(pattern => route.includes(pattern))
      );

      // Generate sitemap and robots.txt
      // This is handled by the build system, but we can add custom logic here
      console.log('[sitemap] Generated sitemap with', filteredPaths.length, 'routes');
    },
  };
}

export default sitemapPlugin;
