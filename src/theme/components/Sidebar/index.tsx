import { useState } from 'react';
import { ChevronRight, X, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router';

export interface SidebarNavItem {
  id: string;
  label: string;
  category?: string | null;
  href?: string;
  type?: 'doc' | 'category';
  items?: SidebarNavItem[];
}

export interface SidebarProps {
  items: SidebarNavItem[];
  isOpen?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, isOpen = true, mobileOpen = false, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(items
      .filter(i => i.category)
      .map(i => i.category!)
    )
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const category = item.category;
    if (category) {
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
    } else {
      if (!acc._root) acc._root = [];
      acc._root.push(item);
    }
    return acc;
  }, {} as Record<string, SidebarNavItem[]>);

  const sidebarContent = (
    <>
      {/* Mobile Header */}
      <div
        className="lg:hidden flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Documentation
        </span>
        <button
          onClick={onClose}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="p-3 space-y-0.5 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - var(--navbar-height) - 1rem)' }}
      >
        {/* Root items */}
        {grouped._root?.map((item) => (
          <SidebarItemLink key={item.id} item={item} onNavigate={onClose} />
        ))}

        {/* Categories */}
        {Object.entries(grouped)
          .filter(([key]) => key !== '_root')
          .map(([category, categoryItems]) => (
            <div key={category} className="mt-4 first:mt-0">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md hoverable"
                style={{ color: 'var(--text-muted)' }}
              >
                <ChevronRight
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    transform: expandedCategories.has(category) ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                />
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
              </button>

              {expandedCategories.has(category) && (
                <div
                  className="mt-0.5 ml-3 pl-3 space-y-0.5 animate-fade-in"
                  style={{ borderLeft: '1px solid var(--border)' }}
                >
                  {categoryItems.map((item) => (
                    <SidebarItemLink key={item.id} item={item} onNavigate={onClose} />
                  ))}
                </div>
              )}
            </div>
          ))}
      </nav>
    </>
  );

  // Mobile sidebar
  if (mobileOpen) {
    return (
      <aside
        className="fixed inset-y-0 left-0 z-50 animate-slide-in-left lg:hidden"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {sidebarContent}
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className="fixed bottom-0 left-0 z-30 hidden lg:block transition-transform"
      style={{
        top: 'var(--navbar-height)',
        width: 'var(--sidebar-width)',
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transitionDuration: 'var(--duration-slow)',
        transitionTimingFunction: 'var(--ease)',
      }}
    >
      {sidebarContent}
    </aside>
  );
}

function SidebarItemLink({ item, onNavigate }: { item: SidebarNavItem; onNavigate?: () => void }) {
  const location = useLocation();

  if (item.type === 'category') {
    return (
      <div
        className="font-medium px-2.5 py-1.5 text-xs uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {item.label}
      </div>
    );
  }

  const href = item.href || `/docs/${item.id}`;
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={`sidebar-item flex items-center gap-2.5 px-2.5 py-2 text-sm ${isActive ? 'active' : ''}`}
    >
      <FileText
        className="w-4 h-4 shrink-0"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
      />
      <span className="truncate">{item.label || item.id}</span>
    </Link>
  );
}
