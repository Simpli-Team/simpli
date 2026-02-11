import { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';
import { Footer } from '../Footer';
import { TOC } from '../TOC';
import { SearchModal } from '../SearchModal';
import type { SidebarNavItem } from '../Sidebar';
import type { TOCHeading } from '../../../core/state/store';

export interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTOC?: boolean;
  sidebarItems?: SidebarNavItem[];
  tocHeadings?: TOCHeading[];
}

export function Layout({
  children,
  showSidebar = true,
  showTOC = true,
  sidebarItems = [],
  tocHeadings = [],
}: LayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden animate-fade-in"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navbar */}
      <Navbar
        onMenuToggle={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarOpen(!sidebarOpen)}
        isMenuOpen={isMobile ? mobileMenuOpen : sidebarOpen}
      />

      <div className="flex" style={{ paddingTop: 'var(--navbar-height)' }}>
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            items={sidebarItems}
            isOpen={sidebarOpen}
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className="flex-1 min-w-0 transition-all"
          style={{
            marginLeft: showSidebar && sidebarOpen && !isMobile ? 'var(--sidebar-width)' : '0',
            transitionDuration: 'var(--duration-slow)',
            transitionTimingFunction: 'var(--ease)',
          }}
        >
          <div className="flex">
            {/* Article Content */}
            <article className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-10">
              <div className="max-w-[var(--content-max-width)] mx-auto animate-fade-in-up">
                {children}
              </div>
            </article>

            {/* TOC - Right Sidebar */}
            {showTOC && tocHeadings.length > 0 && !isMobile && (
              <aside className="hidden xl:block flex-shrink-0" style={{ width: 'var(--toc-width)' }}>
                <TOC headings={tocHeadings} />
              </aside>
            )}
          </div>

          <Footer />
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal />
    </div>
  );
}
