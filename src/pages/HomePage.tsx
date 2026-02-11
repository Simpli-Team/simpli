import { useEffect, useState } from 'react';
import { 
  Zap, 
  Settings, 
  Shield, 
  Puzzle, 
  Search, 
  Moon,
  ArrowRight,
  Github,
  Twitter,
  BookOpen,
  Sparkles,
  Sun
} from 'lucide-react';
import { ThemeProvider, useTheme } from '../theme/components/ThemeProvider';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Vite for instant HMR and optimized production builds.',
    href: '/docs/features/performance'
  },
  {
    icon: Settings,
    title: 'Zero Configuration',
    description: 'Convention over configuration approach. Works out of the box.',
    href: '/docs/getting-started'
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Full TypeScript support with complete type inference.',
    href: '/docs/guides/typescript'
  },
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Extensible architecture with hook-based plugins.',
    href: '/docs/plugins'
  },
  {
    icon: Search,
    title: 'Full-Text Search',
    description: 'Built-in search with FlexSearch. Fast, offline-capable.',
    href: '/docs/features/search'
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'Automatic dark mode support with system preference detection.',
    href: '/docs/features/theming'
  }
];

function HomeContent() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isReady) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--accent-color)' }}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Navbar */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 border-b"
        style={{ 
          backgroundColor: 'var(--bg-navbar)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img 
              src="/logo.svg" 
              alt="Simpli" 
              className="h-8 w-auto"
              style={{ filter: resolvedTheme === 'dark' ? 'invert(1)' : 'none' }}
            />
            <span 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Simpli
            </span>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="/docs" 
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Documentation
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a 
              href="/docs" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--accent-color)',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
            >
              <BookOpen className="w-4 h-4" />
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 lg:pt-40 lg:pb-32"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ 
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Now with React 19 & TypeScript 5.9</span>
          </div>
          
          <h1 
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Documentation made{' '}
            <span style={{ color: 'var(--accent-color)' }}>simple</span>
          </h1>
          
          <p 
            className="text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            A modern documentation framework built with React, TypeScript, and Tailwind CSS. 
            Fast, flexible, and beautifully designed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="/docs"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all"
              style={{ 
                backgroundColor: 'var(--accent-color)',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>

          {/* Code Preview */}
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div 
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ 
                backgroundColor: '#1e1e1e',
                borderColor: '#333'
              }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="ml-4 text-xs text-gray-400 font-mono">Terminal</span>
            </div>
            <div className="p-6 text-left" style={{ backgroundColor: '#1e1e1e' }}>
              <code className="text-sm font-mono text-gray-300">
                <span className="text-gray-500">$</span> npm create simpli@latest my-docs
                <br />
                <span className="text-green-400">✓</span> Project created successfully
                <br />
                <br />
                <span className="text-gray-500">$</span> cd my-docs && npm run dev
                <br />
                <span className="text-blue-400">➜</span> Local: http://localhost:5173/
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-20"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Everything you need
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Built-in features that make documentation a breeze
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <a
                key={idx}
                href={feature.href}
                className="group p-6 rounded-2xl border transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--accent-light)' }}
                >
                  <feature.icon 
                    className="w-6 h-6" 
                    style={{ color: 'var(--accent-color)' }}
                  />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="rounded-3xl p-12 lg:p-16"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
              Create your documentation site in minutes with Simpli.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/docs"
                className="w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-colors"
                style={{ 
                  backgroundColor: 'white',
                  color: 'var(--accent-color)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Read Documentation
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 border-t"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.svg" 
                  alt="Simpli" 
                  className="h-6 w-auto"
                  style={{ filter: resolvedTheme === 'dark' ? 'invert(1)' : 'none' }}
                />
                <span 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Simpli
                </span>
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Modern documentation framework built for speed and flexibility.
              </p>
            </div>
            <div>
              <h4 
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="/docs" 
                    className="transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="/docs/features" 
                    className="transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Resources
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="/docs/api" 
                    className="transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Community
              </h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div 
            className="pt-8 border-t text-center text-sm"
            style={{ 
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <p>© {new Date().getFullYear()} Simpli Framework. Built with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function HomePage() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
