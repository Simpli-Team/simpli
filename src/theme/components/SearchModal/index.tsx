import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, FileText, ArrowRight, X, Hash } from 'lucide-react';
import { SimpliSearchEngine, type SearchResult as EngineResult, type SearchDocument } from '../../../core/content/SearchIndex';
import searchIndexData from 'virtual:simpli/search-index';
import metadataData from 'virtual:simpli/metadata';

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  path: string;
  section: string;
}

// Transform virtual module data to SearchResult format
function transformResults(results: EngineResult[]): SearchResult[] {
  return results.map(r => ({
    id: r.id,
    title: r.title,
    excerpt: r.excerpts?.[0]?.text || '',
    path: r.path,
    section: r.section,
  }));
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('simpli-recent-searches');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const searchEngine = useMemo(() => new SimpliSearchEngine(), []);

  // Load search index
  useEffect(() => {
    try {
      const data = searchIndexData as SearchDocument[];
      if (data && Array.isArray(data)) {
        searchEngine.load(data);
      } else {
        console.warn('[SearchModal] Invalid search index data format');
      }
    } catch (error) {
      console.error('[SearchModal] Failed to load search index:', error);
    }
  }, [searchEngine]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0);
    if (newQuery.trim()) {
      const searchResults = searchEngine.search(newQuery, 10);
      setResults(transformResults(searchResults));
    } else {
      setResults([]);
    }
  };

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 100);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    document.body.style.overflow = '';
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== q);
      const updated = [q, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('simpli-recent-searches', JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleOpen, handleClose]);

  // Handle search trigger button clicks
  useEffect(() => {
    const handleSearchTrigger = () => handleOpen();
    const searchTrigger = document.getElementById('search-trigger');
    const mobileSearch = document.getElementById('mobile-search');

    searchTrigger?.addEventListener('click', handleSearchTrigger);
    mobileSearch?.addEventListener('click', handleSearchTrigger);

    return () => {
      searchTrigger?.removeEventListener('click', handleSearchTrigger);
      mobileSearch?.removeEventListener('click', handleSearchTrigger);
    };
  }, [handleOpen]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
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
          saveRecentSearch(query);
          window.location.href = results[selectedIndex].path;
          handleClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [results, selectedIndex, query, saveRecentSearch, handleClose]);

  // Get quick links from metadata
  const quickLinks = useMemo(() => {
    const meta = metadataData as Record<string, { title?: string }>;
    return Object.entries(meta)
      .slice(0, 5)
      .map(([path, data]) => ({
        id: path,
        title: data.title || path,
        path,
        section: path.split('/')[1] || 'docs',
      }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
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
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-lg outline-none"
            style={{ color: 'var(--text)' }}
          />
          <button
            onClick={handleClose}
            className="btn-ghost p-1.5 rounded-md"
            aria-label="Close search"
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {/* No results */}
          {results.length === 0 && query.trim() && (
            <div className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Empty state - Recent searches + Quick links */}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-6">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>
                    Recent Searches
                  </p>
                  <div className="space-y-0.5 mb-6">
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQueryChange(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hoverable text-left"
                      >
                        <Hash className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text)' }}>{item}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Quick links */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>
                Quick Links
              </p>
              <div className="space-y-0.5">
                {quickLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    onClick={handleClose}
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

          {/* Search results */}
          {results.map((result, idx) => (
            <a
              key={result.id}
              href={result.path}
              onClick={() => {
                saveRecentSearch(query);
                handleClose();
              }}
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
