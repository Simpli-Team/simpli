import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <a
            href="/"
            className="nav-link flex items-center p-1 rounded-md hoverable"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </a>
        </li>

        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            {item.href ? (
              <a href={item.href} className="nav-link">
                {item.label}
              </a>
            ) : (
              <span className="font-medium" style={{ color: 'var(--text)' }}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
