import { ArrowRight, FileText } from 'lucide-react';

export interface CardProps {
  title: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
}

export function Card({ title, description, href, icon }: CardProps) {
  return (
    <a
      href={href}
      className="group block p-6 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50 text-indigo-600">
          {icon || <FileText className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
            {title}
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

export interface CardGroupProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export function CardGroup({ children, cols = 2 }: CardGroupProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid ${colClass} gap-4 my-6`}>
      {children}
    </div>
  );
}
