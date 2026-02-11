// ============================================================================
// Simpli Framework - Default Configuration
// ============================================================================
// Smart defaults that allow zero-config usage. Every option has a sensible
// default so users only need to specify what they want to override.
// ============================================================================

import type { SimpliConfig, ThemeConfig } from './types';

const defaultThemeConfig: Required<ThemeConfig> = {
    navbar: {
        title: 'Simpli',
        logo: undefined,
        items: [],
        hideOnScroll: false,
        style: 'primary',
    },
    sidebar: {
        hideable: true,
        autoCollapseCategories: false,
    },
    footer: {
        style: 'dark',
        logo: undefined,
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Built with Simpli.`,
    },
    colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
    },
    tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
    },
    search: {
        enabled: true,
        provider: 'local',
        algolia: undefined,
        local: {
            indexDocs: true,
            indexBlog: true,
            indexPages: false,
            highlightSearchTerms: true,
            maxResults: 10,
        },
    },
    codeBlock: {
        showLineNumbers: false,
        theme: {
            light: 'github-light',
            dark: 'github-dark',
        },
        magicComments: [
            { className: 'code-line-highlighted', line: 'highlight-next-line' },
            { className: 'code-line-error', line: 'error-line' },
        ],
    },
    announcementBar: undefined as unknown as Required<ThemeConfig>['announcementBar'],
    metadata: [],
    customCss: {},
};

export const DEFAULT_CONFIG: Required<SimpliConfig> = {
    title: 'Simpli Documentation',
    tagline: 'Documentation made simple',
    url: 'http://localhost:3000',
    baseUrl: '/',
    favicon: '/favicon.ico',

    organizationName: '',
    projectName: '',

    docsDir: 'docs',
    blogDir: 'blog',
    pagesDir: 'src/pages',
    staticDir: 'static',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
        localeConfigs: {},
        path: 'i18n',
    },

    themeConfig: defaultThemeConfig,

    markdown: {
        format: 'mdx',
        remarkPlugins: [],
        rehypePlugins: [],
        mermaid: false,
        math: false,
    },

    versioning: {
        enabled: false,
        versions: {},
        lastVersion: undefined,
    },

    build: {
        outDir: 'build',
        trailingSlash: false,
        noIndex: false,
    },

    plugins: [],
    sidebars: {},
    customFields: {},
};

/**
 * Deep merges user config with defaults.
 * User values always take precedence. Arrays are replaced, not merged.
 */
export function mergeWithDefaults(userConfig: Partial<SimpliConfig>): SimpliConfig {
    return deepMerge(DEFAULT_CONFIG, userConfig) as unknown as SimpliConfig;
}

// ---------------------------------------------------------------------------
// Deep merge utility (arrays are replaced, objects are merged recursively)
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
): Record<string, unknown> {
    const output = { ...target };

    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];

        if (sourceVal === undefined) {
            continue;
        }

        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
            output[key] = deepMerge(targetVal, sourceVal);
        } else {
            output[key] = sourceVal;
        }
    }

    return output;
}
