import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
  title: string;
  href: string;
}

export interface PaginationProps {
  prev?: PaginationLink;
  next?: PaginationLink;
}

export function Pagination({ prev, next }: PaginationProps) {
  return (
    <nav
      className="flex items-stretch justify-between gap-4 mt-16 pt-8"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {prev ? (
        <a
          href={prev.href}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl card-hover flex-1"
          style={{ background: 'var(--bg-soft)' }}
        >
          <ChevronLeft
            className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-0.5"
            style={{ color: 'var(--text-muted)' }}
          />
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Previous
            </div>
            <div className="font-medium" style={{ color: 'var(--text)' }}>
              {prev.title}
            </div>
          </div>
        </a>
      ) : (
        <div />
      )}

      {next ? (
        <a
          href={next.href}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl card-hover flex-1 justify-end"
          style={{ background: 'var(--bg-soft)' }}
        >
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Next
            </div>
            <div className="font-medium" style={{ color: 'var(--text)' }}>
              {next.title}
            </div>
          </div>
          <ChevronRight
            className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--text-muted)' }}
          />
        </a>
      ) : (
        <div />
      )}
    </nav>
  );
}
