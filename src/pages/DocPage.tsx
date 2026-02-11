import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
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

// MDX components mapping - using simpli-content CSS class for base typography
const mdxComponents = {
  // Custom components
  Card,
  Admonition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Details,

  // Code blocks
  pre: (props: { children?: React.ReactNode } & Record<string, unknown>) => {
    const childEl = props.children as React.ReactElement<{ children?: string; className?: string }> | undefined;
    const code = childEl?.props?.children ?? '';
    const className = childEl?.props?.className ?? '';
    return <CodeBlock className={className}>{typeof code === 'string' ? code : ''}</CodeBlock>;
  },
};

// Import all doc files dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const docModules = (import.meta as any).glob('../../docs/**/*.mdx', { eager: true });

interface DocModule {
  default: React.ComponentType;
  frontmatter?: {
    title?: string;
    description?: string;
    sidebar_position?: number;
  };
}

interface DocInfo {
  id: string;
  title: string;
  path: string;
  category: string | null;
}

export function DocPage() {
  const slug = window.location.pathname.replace('/docs/', '') || 'intro';
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [frontmatter, setFrontmatter] = useState<{ title?: string, description?: string }>({});
  const [tocHeadings, setTocHeadings] = useState<TOCHeading[]>([]);
  const [sidebarItems, setSidebarItems] = useState<SidebarNavItem[]>([]);
  const [docInfo, setDocInfo] = useState<DocInfo[]>([]);

  // Generate doc list from modules
  useEffect(() => {
    const docs: DocInfo[] = Object.keys(docModules).map(path => {
      const mod = docModules[path] as DocModule;
      const relativePath = path.replace('../../docs/', '').replace('.mdx', '');
      const segments = relativePath.split('/');
      const fileName = segments[segments.length - 1];
      const category = segments.length > 1 ? segments[0] : null;

      return {
        id: relativePath,
        title: mod.frontmatter?.title || fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        path: relativePath,
        category,
      };
    }).sort((a, b) => {
      if (a.category !== b.category) {
        if (!a.category) return -1;
        if (!b.category) return 1;
        return a.category.localeCompare(b.category);
      }
      const modA = docModules[`../../docs/${a.path}.mdx`] as DocModule;
      const modB = docModules[`../../docs/${b.path}.mdx`] as DocModule;
      const posA = modA.frontmatter?.sidebar_position ?? 999;
      const posB = modB.frontmatter?.sidebar_position ?? 999;
      return posA - posB || a.title.localeCompare(b.title);
    });

    setDocInfo(docs);

    const items: SidebarNavItem[] = docs.map(doc => ({
      type: 'doc' as const,
      id: doc.id,
      label: doc.title,
      category: doc.category,
      href: `/docs/${doc.path}`,
    }));
    setSidebarItems(items);
  }, []);

  // Load current doc
  useEffect(() => {
    const docPath = `../../docs/${slug}.mdx`;
    const module = docModules[docPath] as DocModule | undefined;

    if (module) {
      setContent(() => module.default);
      setFrontmatter(module.frontmatter || {});

      // Extract headings from the rendered content after a tick
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
    }
  }, [slug]);

  // Generate breadcrumbs
  const breadcrumbs = slug
    ? [{ label: 'Docs', href: '/docs' }, { label: frontmatter.title || slug }]
    : [{ label: 'Docs' }];

  // Generate prev/next navigation
  const currentIndex = docInfo.findIndex(d => d.path === slug);
  const prev = currentIndex > 0 ? docInfo[currentIndex - 1] : undefined;
  const next = currentIndex < docInfo.length - 1 ? docInfo[currentIndex + 1] : undefined;

  if (!Content) {
    return <Navigate to="/docs/intro" replace />;
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
