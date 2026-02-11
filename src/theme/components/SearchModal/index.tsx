import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, FileText, ArrowRight, X } from 'lucide-react';

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  path: string;
  section: string;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchData: SearchResult[] = [
    { id: '1', title: 'Introduction', excerpt: 'Welcome to Simpli documentation framework', path: '/docs/intro', section: 'Getting Started' },
    { id: '2', title: 'Installation', excerpt: 'How to install Simpli using npm, yarn, or pnpm', path: '/docs/getting-started/installation', section: 'Getting Started' },
    { id: '3', title: 'Configuration', excerpt: 'Learn how to configure your Simpli site', path: '/docs/configuration', section: 'Guide' },
  ];

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle search trigger button clicks
  useEffect(() => {
    const handleSearchTrigger = () => setIsOpen(true);
    const searchTrigger = document.getElementById('search-trigger');
    const mobileSearch = document.getElementById('mobile-search');
    
    searchTrigger?.addEventListener('click', handleSearchTrigger);
    mobileSearch?.addEventListener('click', handleSearchTrigger);
    
    return () => {
      searchTrigger?.removeEventListener('click', handleSearchTrigger);
      mobileSearch?.removeEventListener('click', handleSearchTrigger);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (query.trim()) {
      const filtered = searchData.filter(
        item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].path;
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [results, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-lg outline-none"
            style={{
              color: 'var(--text)',
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="btn-ghost p-1.5 rounded-md"
            aria-label="Close search"
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && query.trim() && (
            <div className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>
                Quick Links
              </p>
              <div className="space-y-0.5">
                {searchData.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hoverable"
                  >
                    <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="flex-1">
                      <div style={{ color: 'var(--text)' }}>{item.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.section}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {results.map((result, idx) => (
            <a
              key={result.id}
              href={result.path}
              onClick={() => setIsOpen(false)}
              className="flex items-start gap-3 px-4 py-3 group transition-all"
              style={{
                background: idx === selectedIndex ? 'var(--bg-secondary)' : 'transparent',
              }}
            >
              <FileText 
                className="w-5 h-5 mt-0.5 shrink-0" 
                style={{ color: idx === selectedIndex ? 'var(--accent)' : 'var(--text-muted)' }} 
              />
              <div className="flex-1 min-w-0">
                <div 
                  className="font-medium" 
                  style={{ color: idx === selectedIndex ? 'var(--accent)' : 'var(--text)' }}
                >
                  {result.title}
                </div>
                <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {result.excerpt}
                </p>
                <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>
                  {result.section}
                </span>
              </div>
              <ArrowRight
                className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-xs"
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1">
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >esc</kbd>
              <span>close</span>
            </span>
          </div>
          {query.trim() && (
            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}
