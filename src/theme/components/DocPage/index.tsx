import { Layout } from '../Layout';
import { Breadcrumb } from '../Breadcrumb';
import { Pagination } from '../Pagination';
import type { SidebarNavItem } from '../Sidebar';
import type { TOCHeading } from '../../../core/state/store';

export interface DocPageProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  sidebarItems?: SidebarNavItem[];
  tocHeadings?: TOCHeading[];
  breadcrumbs?: Array<{ label: string; href?: string }>;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function DocPage({
  children,
  title,
  description,
  sidebarItems,
  tocHeadings,
  breadcrumbs,
  prev,
  next,
}: DocPageProps) {
  return (
    <Layout 
      sidebarItems={sidebarItems} 
      tocHeadings={tocHeadings}
      showSidebar={!!sidebarItems}
      showTOC={!!tocHeadings && tocHeadings.length > 0}
    >
      <article className="simpli-prose">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--simpli-text)]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-xl text-[var(--simpli-text-secondary)]">
              {description}
            </p>
          )}
        </header>

        <div className="prose-content">
          {children}
        </div>

        <Pagination
          prev={prev}
          next={next}
        />
      </article>
    </Layout>
  );
}
