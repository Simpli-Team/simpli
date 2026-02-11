import { Layout } from '../Layout';
import type { BlogPostMetadata } from '../../../core/config/types';

export interface BlogPageProps {
  children: React.ReactNode;
  metadata: BlogPostMetadata;
}

export function BlogPage({ children, metadata }: BlogPageProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout showSidebar={false} showTOC={false}>
      <article className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-[var(--simpli-text-tertiary)] mb-4">
            <time dateTime={metadata.date}>{formatDate(metadata.date)}</time>
            {metadata.readingTime && (
              <>
                <span>•</span>
                <span>{metadata.readingTime} min read</span>
              </>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--simpli-text)]">
            {metadata.title}
          </h1>
          
          {metadata.description && (
            <p className="mt-4 text-xl text-[var(--simpli-text-secondary)]">
              {metadata.description}
            </p>
          )}

          {metadata.authors && metadata.authors.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {metadata.authors.map((author, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {author.imageUrl && (
                    <img 
                      src={author.imageUrl} 
                      alt={author.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <div className="text-sm font-medium text-[var(--simpli-text)]">
                      {author.name}
                    </div>
                    {author.title && (
                      <div className="text-xs text-[var(--simpli-text-tertiary)]">
                        {author.title}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {metadata.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog/tags/${tag}`}
                  className="px-3 py-1 text-sm rounded-full bg-[var(--simpli-bg-secondary)] text-[var(--simpli-text-secondary)] hover:text-[var(--simpli-primary-600)] transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}
        </header>

        {metadata.image && (
          <img 
            src={metadata.image} 
            alt={metadata.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
          />
        )}

        <div className="simpli-prose">
          {children}
        </div>
      </article>
    </Layout>
  );
}
