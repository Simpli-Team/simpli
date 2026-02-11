import { useEffect, useState } from 'react';
import type { TOCHeading } from '../../../core/state/store';

export interface TOCProps {
  headings: TOCHeading[];
}

export function TOC({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -66%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div
      className="sticky py-6 pr-4"
      style={{
        top: 'calc(var(--navbar-height) + 1.5rem)',
      }}
    >
      <h5
        className="text-xs font-semibold uppercase tracking-wider mb-4 pl-4"
        style={{ color: 'var(--text-muted)' }}
      >
        On this page
      </h5>
      <nav className="relative">
        {/* Active indicator bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ background: 'var(--border)' }}
        />

        <div className="space-y-0.5">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`toc-item block text-[13px] py-1.5 relative ${isActive ? 'active' : ''}`}
                style={{
                  paddingLeft: heading.level === 2 ? '1rem' : '1.75rem',
                }}
              >
                {/* Active bar highlight */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full transition-all"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                {heading.text}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
