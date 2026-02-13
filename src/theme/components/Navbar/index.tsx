import { Menu, Search, Sun, Moon, Monitor, Github } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useState, useEffect } from 'react';
import configData from 'virtual:simpli/config';

export interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [navbarConfig, setNavbarConfig] = useState<{
    title?: string;
    logo?: { src?: string; alt?: string };
    items?: Array<{
      label?: string;
      to?: string;
      href?: string;
      type?: string;
      position?: 'left' | 'right';
    }>;
  }>({});

  // Load config from virtual module
  useEffect(() => {
    const config = configData as { themeConfig?: { navbar?: typeof navbarConfig } };
    setNavbarConfig(config.themeConfig?.navbar || {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ThemeIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;
  const logoSrc = navbarConfig.logo?.src || '/logo.svg';
  const logoAlt = navbarConfig.logo?.alt || navbarConfig.title || 'Logo';
  const siteTitle = navbarConfig.title || 'Simpli';

  // Filter navbar items
  const leftItems = navbarConfig.items?.filter(item => 
    !item.position || item.position === 'left'
  ) || [];
  const rightItems = navbarConfig.items?.filter(item => 
    item.position === 'right'
  ) || [];

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
        {/* Left: Menu + Logo + Nav Items */}
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
            <img 
              src={logoSrc}
              alt={logoAlt}
              className="w-8 h-8 transition-transform group-hover:scale-105"
            />
            <span
              className="text-xl font-bold tracking-tight hidden sm:block"
              style={{ color: 'var(--text)' }}
            >
              {siteTitle}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {leftItems.filter(item => item.type !== 'search' && item.type !== 'themeToggle').map((item, idx) => (
              <a
                key={idx}
                href={item.to || item.href || '/'}
                className="px-3 py-2 text-sm font-medium rounded-lg hoverable"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.label}
              </a>
            ))}
          </nav>
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
          {rightItems.some(item => item.type === 'themeToggle') && (
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="btn-ghost p-2.5 rounded-lg flex items-center gap-2"
              aria-label={`Theme: ${theme}`}
              title={`Theme: ${theme} (click to cycle)`}
            >
              <ThemeIcon className="w-[18px] h-[18px]" style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}

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
