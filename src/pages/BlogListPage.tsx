import { Layout } from '../theme/components/Layout';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'welcome',
    title: 'Welcome to Simpli',
    description: 'Introducing Simpli - a modern documentation framework built for speed and flexibility.',
    date: '2024-01-01',
    readingTime: '5 min',
    tags: ['announcement', 'getting-started'],
    image: '/logo.svg'
  }
];

export function BlogListPage() {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout showSidebar={false} showTOC={false}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: 'var(--text)' }}
          >
            Blog
          </h1>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Latest updates, tutorials, and insights about Simpli
          </p>
        </header>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
              style={{ 
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)'
              }}
            >
              {/* Image */}
              {post.image && (
                <div 
                  className="aspect-video overflow-hidden flex items-center justify-center p-8"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-32 h-32 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div 
                  className="flex items-center gap-4 text-sm mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{post.readingTime} read</span>
                  </div>
                </div>

                {/* Title */}
                <h2 
                  className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors"
                  style={{ color: 'var(--text)' }}
                >
                  <a href={`/blog/${post.id}`}>
                    {post.title}
                  </a>
                </h2>

                {/* Description */}
                <p 
                  className="mb-4 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {post.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full"
                      style={{ 
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <a
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors group-hover:text-accent"
                  style={{ color: 'var(--accent)' }}
                >
                  Read more
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {blogPosts.length === 0 && (
          <div 
            className="text-center py-20 rounded-2xl"
            style={{ 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            <p 
              className="text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
