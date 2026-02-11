import { useParams, Navigate } from 'react-router';
import { Layout } from '../theme/components/Layout';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  image?: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

const blogPosts: Record<string, BlogPost> = {
  'welcome': {
    id: 'welcome',
    title: 'Welcome to Simpli',
    description: 'Introducing Simpli - a modern documentation framework built for speed and flexibility.',
    date: '2024-01-01',
    readingTime: '5 min',
    tags: ['announcement', 'getting-started'],
    image: '/logo.svg',
    author: {
      name: 'Simpli Team',
      title: 'Core Team'
    },
    content: `
# Welcome to Simpli

We're excited to introduce **Simpli** - a modern documentation framework that makes creating beautiful documentation sites incredibly simple.

## Why Simpli?

Building documentation shouldn't be complicated. That's why we created Simpli with these core principles:

### 🚀 Lightning Fast
Built on Vite for instant hot module replacement and optimized production builds. Your documentation site loads in milliseconds.

### 🎨 Beautiful by Default
Comes with a stunning, modern design out of the box. Dark mode, responsive layout, and smooth animations included.

### 📝 MDX Support
Write your documentation in MDX - combine the simplicity of Markdown with the power of React components.

### 🔧 Zero Configuration
Convention over configuration. Just create your content and Simpli handles the rest.

## Getting Started

Getting started with Simpli is as easy as running a single command:

\`\`\`bash
npm create simpli@latest my-docs
cd my-docs
npm run dev
\`\`\`

That's it! Your documentation site is now running at \`http://localhost:5173\`.

## Key Features

- **TypeScript Support**: Full type safety with TypeScript 5.9
- **Plugin System**: Extend functionality with powerful plugins
- **Search**: Built-in full-text search with FlexSearch
- **SEO Optimized**: Automatic sitemap generation and meta tags
- **Responsive**: Mobile-first design that works everywhere

## What's Next?

We're just getting started! Here's what's coming soon:

1. **More Themes**: Additional built-in themes and theme customization
2. **i18n Support**: Multi-language documentation support
3. **Analytics**: Built-in analytics integration
4. **More Plugins**: Expanding the plugin ecosystem

## Join the Community

We'd love to hear from you! Join our community:

- **GitHub**: Star us and contribute
- **Discord**: Join our community chat
- **Twitter**: Follow for updates

Thank you for choosing Simpli. We can't wait to see what you build!

---

*The Simpli Team*
    `
  }
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug] : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout showSidebar={false} showTOC={false}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <a
          href="/blog"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors hover:text-accent"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </a>

        {/* Header */}
        <header className="mb-12">
          {/* Meta */}
          <div 
            className="flex items-center gap-4 text-sm mb-4"
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
          <h1 
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: 'var(--text)' }}
          >
            {post.title}
          </h1>

          {/* Description */}
          <p 
            className="text-xl leading-relaxed mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.description}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Tag className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog/tags/${tag}`}
                  className="px-3 py-1 text-sm rounded-full transition-colors hover:text-accent"
                  style={{ 
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            {post.author.avatar && (
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <div className="font-medium" style={{ color: 'var(--text)' }}>
                {post.author.name}
              </div>
              {post.author.title && (
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {post.author.title}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div 
            className="mb-12 rounded-2xl overflow-hidden flex items-center justify-center p-12"
            style={{ 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            <img 
              src={post.image} 
              alt={post.title}
              className="w-48 h-48 object-contain"
            />
          </div>
        )}

        {/* Content */}
        <article 
          className="simpli-content prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ 
            __html: post.content
              .split('\n')
              .map(line => {
                // Headers
                if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                
                // Bold
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // Code blocks
                if (line.startsWith('```')) {
                  return line.includes('bash') ? '<pre><code class="language-bash">' : '</code></pre>';
                }
                
                // Inline code
                line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
                
                // Lists
                if (line.match(/^\d+\./)) return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
                
                // Horizontal rule
                if (line === '---') return '<hr />';
                
                // Paragraphs
                if (line.trim() && !line.startsWith('<')) return `<p>${line}</p>`;
                
                return line;
              })
              .join('\n')
          }}
        />

        {/* Footer */}
        <footer 
          className="pt-8 mt-12"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </a>
            
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Share this post
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:bg-secondary"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
