import { Menu, Search, Sun, Moon, Monitor, Github } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useState, useEffect } from 'react';

export interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ThemeIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;

  return (
    <header
      id="simpli-navbar"
      className={`fixed top-0 left-0 right-0 z-50 glass transition-all ${scrolled ? 'shadow-sm' : ''}`}
      style={{
        height: 'var(--navbar-height)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      }}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle"
            onClick={onMenuToggle}
            className="btn-ghost p-2 rounded-lg lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>

          <a href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span
              className="text-xl font-bold tracking-tight hidden sm:block"
              style={{ color: 'var(--text)' }}
            >
              Simpli
            </span>
          </a>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            id="search-trigger"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm rounded-lg btn-soft"
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="flex-1 text-left" style={{ color: 'var(--text-muted)' }}>Search documentation...</span>
            <kbd
              className="px-1.5 py-0.5 text-xs rounded font-mono"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="btn-ghost p-2.5 rounded-lg flex items-center gap-2"
            aria-label={`Theme: ${theme}`}
            title={`Theme: ${theme} (click to cycle)`}
          >
            <ThemeIcon className="w-[18px] h-[18px]" style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Mobile Search */}
          <button
            id="mobile-search"
            className="btn-ghost md:hidden p-2.5 rounded-lg"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* GitHub */}
          <a
            id="github-link"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost p-2.5 rounded-lg hidden sm:flex"
            aria-label="GitHub"
          >
            <Github className="w-[18px] h-[18px]" style={{ color: 'var(--text-secondary)' }} />
          </a>
        </div>
      </div>
    </header>
  );
}
