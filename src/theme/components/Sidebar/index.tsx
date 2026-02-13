import { useState } from 'react';
import { ChevronRight, X, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router';

export interface SidebarNavItem {
  id: string;
  label: string;
  category?: string | null;
  href?: string;
  type?: 'doc' | 'category' | 'link';
  items?: SidebarNavItem[];
  collapsed?: boolean;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  isOpen?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, isOpen = true, mobileOpen = false, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(
      items
        .filter(i => i.type === 'category')
        .map(i => i.id)
    )
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

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
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            onNavigate={onClose}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
          />
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

function SidebarItem({
  item,
  onNavigate,
  expandedCategories,
  toggleCategory,
  depth = 0,
}: {
  item: SidebarNavItem;
  onNavigate?: () => void;
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  depth?: number;
}) {
  const location = useLocation();

  if (item.type === 'category') {
    const isExpanded = expandedCategories.has(item.id);
    const hasLink = !!item.href;

    return (
      <div className="mt-2 first:mt-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleCategory(item.id)}
            className="flex items-center gap-2 px-2.5 py-2 text-sm font-medium rounded-md hoverable flex-1"
            style={{ 
              color: 'var(--text)',
              paddingLeft: `${depth * 0.75 + 0.625}rem`,
            }}
          >
            <ChevronRight
              className="w-3.5 h-3.5 shrink-0 transition-transform"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
            <span className="truncate">{item.label}</span>
          </button>
          {hasLink && (
            <Link
              to={item.href!}
              onClick={onNavigate}
              className="p-2 rounded-md hoverable"
              title={`Go to ${item.label}`}
              preventScrollReset
            >
              <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </Link>
          )}
        </div>

        {isExpanded && item.items && item.items.length > 0 && (
          <div
            className="mt-0.5 ml-3 pl-3 space-y-0.5 animate-fade-in"
            style={{ borderLeft: '1px solid var(--border)' }}
          >
            {item.items.map((childItem) => (
              <SidebarItem
                key={childItem.id}
                item={childItem}
                onNavigate={onNavigate}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
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
      style={{ paddingLeft: `${depth * 0.75 + 0.625}rem` }}
      preventScrollReset
    >
      <FileText
        className="w-4 h-4 shrink-0"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
      />
      <span className="truncate">{item.label || item.id}</span>
    </Link>
  );
}
