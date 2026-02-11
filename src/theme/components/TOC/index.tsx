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
        // Find the first intersecting entry
        const intersecting = entries.find(entry => entry.isIntersecting);
        if (intersecting) {
          setActiveId(intersecting.target.id);
        }
      },
      { 
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    const elements: Element[] = [];
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        elements.push(element);
        observer.observe(element);
      }
    });

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div
      className="sticky py-6 pr-4 pl-4"
      style={{
        top: 'calc(var(--navbar-height) + 1.5rem)',
        maxHeight: 'calc(100vh - var(--navbar-height) - 3rem)',
        overflowY: 'auto',
      }}
    >
      <h5
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        On this page
      </h5>
      <nav className="relative">
        {/* Active indicator bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
          style={{ background: 'var(--border)' }}
        />

        <ul className="space-y-1">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                      setActiveId(heading.id);
                    }
                  }}
                  className="toc-item block text-sm py-2 relative transition-all"
                  style={{
                    paddingLeft: heading.level === 2 ? '1rem' : '1.75rem',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {/* Active bar highlight */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                  <span className={isActive ? 'font-medium' : ''}>
                    {heading.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
