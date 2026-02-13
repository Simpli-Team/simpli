import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Layout } from '../theme/components/Layout';
import {
  Card,
  Admonition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Details,
  CodeBlock,
  Breadcrumb,
  Pagination
} from '../theme';
import type { TOCHeading } from '../core/state/store';
import type { SidebarNavItem } from '../theme/components/Sidebar';
import sidebarData from 'virtual:simpli/sidebar';
import metadataData from 'virtual:simpli/metadata';

// MDX components mapping
const mdxComponents = {
  Card,
  Admonition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Details,
  pre: (props: { children?: React.ReactNode } & Record<string, unknown>) => {
    const childEl = props.children as React.ReactElement<{ children?: string; className?: string }> | undefined;
    const code = childEl?.props?.children ?? '';
    const className = childEl?.props?.className ?? '';
    return <CodeBlock className={className}>{typeof code === 'string' ? code : ''}</CodeBlock>;
  },
};

// Dynamically import MDX modules
const docModules: Record<string, { default: React.ComponentType; frontmatter?: Record<string, unknown> }> = import.meta.glob('/docs/**/*.mdx', { eager: true });

interface DocInfo {
  id: string;
  title: string;
  path: string;
  category: string | null;
  position: number;
}

export function DocPage() {
  const params = useParams();
  const slug = params['*'] || 'intro';
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [frontmatter, setFrontmatter] = useState<{ title?: string; description?: string }>({});
  const [tocHeadings, setTocHeadings] = useState<TOCHeading[]>([]);
  const [sidebarItems, setSidebarItems] = useState<SidebarNavItem[]>([]);
  const [docInfo, setDocInfo] = useState<DocInfo[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Build sidebar items from virtual module
  useEffect(() => {
    const sidebar = sidebarData as Record<string, Array<{ type?: string; id?: string; label?: string; href?: string; items?: unknown[] }>>;
    const docsItems = sidebar.docs || [];

    const items: SidebarNavItem[] = [];

    function processItems(itemsList: unknown[], parentCategory?: string): void {
      for (const item of itemsList) {
        if (typeof item === 'string') {
          // Simple doc ID
          const meta = getDocMetadata(item);
          items.push({
            type: 'doc',
            id: item,
            label: meta.title || item,
            href: `/docs/${item}`,
          });
        } else if (item && typeof item === 'object') {
          const typedItem = item as { type?: string; id?: string; label?: string; href?: string; items?: unknown[] };

          if (typedItem.type === 'category' && typedItem.items) {
            // Category
            items.push({
              type: 'category',
              id: typedItem.id || typedItem.label || 'category',
              label: typedItem.label || 'Category',
              items: [],
              collapsed: false,
            });
            processItems(typedItem.items, typedItem.id);
          } else if (typedItem.type === 'doc' || typedItem.id) {
            // Doc item
            const meta = getDocMetadata(typedItem.id || '');
            items.push({
              type: 'doc',
              id: typedItem.id || '',
              label: typedItem.label || meta.title || typedItem.id || '',
              href: `/docs/${typedItem.id}`,
              category: parentCategory,
            });
          } else if (typedItem.type === 'link' && typedItem.href) {
            // Link item
            items.push({
              type: 'link',
              id: typedItem.href,
              label: typedItem.label || typedItem.href,
              href: typedItem.href,
            });
          }
        }
      }
    }

    processItems(docsItems);
    setSidebarItems(items);
  }, []);

  // Get doc metadata from virtual module
  function getDocMetadata(id: string): { title: string; description?: string } {
    const metadata = metadataData as Record<string, { title: string; description?: string }>;
    const pathKey = `/docs/${id}`;
    return metadata[pathKey] || { title: id };
  }

  // Generate doc list from modules
  useEffect(() => {
    const docs: DocInfo[] = [];

    for (const [path, moduleItem] of Object.entries(docModules)) {
      const mod = moduleItem as { default: React.ComponentType; frontmatter?: Record<string, unknown> };
      const relativePath = path.replace('/docs/', '').replace('.mdx', '');
      const segments = relativePath.split('/');
      const fileName = segments[segments.length - 1];
      const category = segments.length > 1 ? segments[0] : null;
      const fm = mod.frontmatter || {};

      docs.push({
        id: relativePath,
        title: (fm.title as string) || fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        path: relativePath,
        category,
        position: (fm.sidebar_position as number) ?? 999,
      });
    }

    // Sort docs
    docs.sort((a, b) => {
      if (a.category !== b.category) {
        if (!a.category) return -1;
        if (!b.category) return 1;
        return a.category.localeCompare(b.category);
      }
      return a.position - b.position || a.title.localeCompare(b.title);
    });

    setDocInfo(docs);
  }, []);

  // Load current doc
  useEffect(() => {
    const docPath = `/docs/${slug}.mdx`;
    const module = docModules[docPath];

    if (module) {
      setContent(() => module.default);
      setFrontmatter({
        title: module.frontmatter?.title as string,
        description: module.frontmatter?.description as string,
      });
      setNotFound(false);

      // Extract headings from the rendered content
      requestAnimationFrame(() => {
        const article = document.querySelector('.simpli-content');
        if (article) {
          const headingEls = article.querySelectorAll('h2, h3');
          const headings: TOCHeading[] = Array.from(headingEls).map(el => ({
            id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '',
            text: el.textContent || '',
            level: el.tagName === 'H2' ? 2 : 3,
          }));
          setTocHeadings(headings);
        }
      });
    } else {
      setNotFound(true);
    }
  }, [slug]);

  // Generate breadcrumbs from slug path segments
  const generateBreadcrumbs = () => {
    if (!slug) return [{ label: 'Docs' }];

    const segments = slug.split('/');
    const breadcrumbs: Array<{ label: string; href?: string }> = [
      { label: 'Docs', href: '/docs' }
    ];

    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      // For the last segment, use the page title if available
      const isLast = i === segments.length - 1;
      const label = isLast && frontmatter.title
        ? frontmatter.title
        : formatSegmentLabel(segment);

      // Only add href for non-last items (last item is current page)
      const href = isLast ? undefined : `/docs/${currentPath}`;

      breadcrumbs.push({ label, href });
    }

    return breadcrumbs;
  };

  // Format segment name to readable label (e.g., "getting-started" -> "Getting Started")
  const formatSegmentLabel = (segment: string): string => {
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const breadcrumbs = generateBreadcrumbs();

  // Generate prev/next navigation
  const currentIndex = docInfo.findIndex(d => d.path === slug);
  const prev = currentIndex > 0 ? docInfo[currentIndex - 1] : undefined;
  const next = currentIndex < docInfo.length - 1 && currentIndex !== -1 ? docInfo[currentIndex + 1] : undefined;

  if (notFound) {
    return <Navigate to="/docs/intro" replace />;
  }

  if (!Content) {
    return (
      <Layout showSidebar={true} showTOC={false} sidebarItems={sidebarItems}>
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      showSidebar={true}
      showTOC={true}
      sidebarItems={sidebarItems}
      tocHeadings={tocHeadings}
    >
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}
        >
          {frontmatter.title || 'Documentation'}
        </h1>
        {frontmatter.description && (
          <p className="mt-3 text-lg" style={{ color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
            {frontmatter.description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="simpli-content">
        <MDXProvider components={mdxComponents}>
          <Content />
        </MDXProvider>
      </div>

      {/* Pagination */}
      <Pagination
        prev={prev ? { title: prev.title, href: `/docs/${prev.path}` } : undefined}
        next={next ? { title: next.title, href: `/docs/${next.path}` } : undefined}
      />
    </Layout>
  );
}
