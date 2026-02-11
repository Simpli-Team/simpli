import type { SimpliPluginInstance } from '../../core/config/types';

export interface ContentDocsPluginOptions {
  path?: string;
  routeBasePath?: string;
  sidebarPath?: string;
  includeDrafts?: boolean;
}

export function contentDocsPlugin(options: ContentDocsPluginOptions = {}): SimpliPluginInstance {
  const { 
    path: docsPath = 'docs', 
  } = options;

  return {
    name: '@simpli/plugin-content-docs',
    
    configLoaded(config) {
      // Set docs directory if not already set
      if (!config.docsDir) {
        config.docsDir = docsPath;
      }
      return config;
    },


  };
}

export default contentDocsPlugin;
