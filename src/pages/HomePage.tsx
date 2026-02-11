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
  BookOpen,
  Sparkles,
  Sun,
  Palette,
  Star,
  Check
} from 'lucide-react';
import { ThemeProvider, useTheme } from '../theme/components/ThemeProvider';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Vite with instant HMR. Cold start under 100ms.',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Settings,
    title: 'Zero Config',
    description: 'Convention over configuration. Works out of the box.',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Full TypeScript support with complete type inference.',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Extensible architecture with powerful hook-based plugins.',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Built-in full-text search with FlexSearch. Fast & offline.',
    gradient: 'from-indigo-400 to-purple-500'
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Dark mode, custom themes, and beautiful components.',
    gradient: 'from-pink-400 to-rose-500'
  }
];

const stats = [
  { value: '<100ms', label: 'Cold Start' },
  { value: '10KB', label: 'Core Size' },
  { value: '100%', label: 'Type Safe' },
  { value: '∞', label: 'Extensible' }
];

const highlights = [
  'MDX Support',
  'React 19',
  'TypeScript 5.9',
  'Tailwind CSS',
  'Vite 6',
  'Hot Reload'
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
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
        />
      </div>

      {/* Navbar */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ 
          height: 'var(--navbar-height)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.svg" 
              alt="Simpli" 
              className="h-8 w-auto transition-transform group-hover:scale-110"
            />
            <span 
              className="text-xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              Simpli
            </span>
          </a>
          
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="/docs" 
              className="text-sm font-medium transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              Docs
            </a>
            <a 
              href="/blog" 
              className="text-sm font-medium transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              Blog
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2.5 rounded-lg"
              aria-label="Toggle theme"
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
              className="btn-ghost p-2.5 rounded-lg hidden sm:flex"
            >
              <Github className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </a>
            <a 
              href="/docs" 
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in"
              style={{ 
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span>Now with React 19 & TypeScript 5.9</span>
            </div>
            
            {/* Heading */}
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
              style={{ color: 'var(--text)' }}
            >
              Documentation made{' '}
              <span 
                className="relative inline-block"
                style={{ color: 'var(--accent)' }}
              >
                simple
                <svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  height="8" 
                  viewBox="0 0 200 8"
                  style={{ opacity: 0.5 }}
                >
                  <path 
                    d="M0 4 Q50 0, 100 4 T200 4" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </h1>
            
            {/* Description */}
            <p 
              className="text-xl lg:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              A modern documentation framework built with React, TypeScript, and Tailwind CSS. 
              Fast, flexible, and beautifully designed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a
                href="/docs"
                className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-soft px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{ 
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  {item}
                </div>
              ))}
            </div>

            {/* Code Preview */}
            <div 
              className="max-w-3xl mx-auto rounded-2xl overflow-hidden animate-fade-in"
              style={{ 
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border)'
              }}
            >
              <div 
                className="flex items-center justify-between px-4 py-3"
                style={{ 
                  background: resolvedTheme === 'dark' ? '#1e1e1e' : '#f5f5f5',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span 
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Terminal
                </span>
                <div className="w-16" />
              </div>
              <div 
                className="p-6 text-left font-mono text-sm"
                style={{ 
                  background: resolvedTheme === 'dark' ? '#1e1e1e' : '#ffffff'
                }}
              >
                <div style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: '#6b7280' }}>$</span> npm create simpli@latest my-docs
                </div>
                <div style={{ color: '#10b981' }} className="mt-2">
                  ✓ Project created successfully
                </div>
                <div className="mt-4" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: '#6b7280' }}>$</span> cd my-docs && npm run dev
                </div>
                <div style={{ color: '#3b82f6' }} className="mt-2">
                  ➜ Local: http://localhost:5173/
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16"
        style={{ 
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'var(--text)' }}
            >
              Everything you need
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Built-in features that make documentation a breeze
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl transition-all hover:-translate-y-1"
                style={{ 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ 
                    background: `linear-gradient(135deg, var(--accent), transparent)`
                  }}
                />
                
                <div className="relative">
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${feature.gradient}`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-3"
                    style={{ color: 'var(--text)' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative rounded-3xl p-12 lg:p-16 overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, var(--accent), ${resolvedTheme === 'dark' ? '#7e22ce' : '#9333ea'})`,
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create your documentation site in minutes with Simpli. 
                Zero configuration, maximum flexibility.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/docs"
                  className="px-8 py-4 font-semibold rounded-xl transition-all hover:scale-105 w-full sm:w-auto flex items-center justify-center gap-2"
                  style={{ 
                    background: 'white',
                    color: 'var(--accent)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                  Read Documentation
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 font-semibold rounded-xl transition-all hover:bg-white/30 w-full sm:w-auto flex items-center justify-center gap-2"
                  style={{ 
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-16"
        style={{ 
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.svg" 
                  alt="Simpli" 
                  className="h-8 w-auto"
                />
                <span 
                  className="text-xl font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  Simpli
                </span>
              </div>
              <p 
                className="text-sm leading-relaxed max-w-md"
                style={{ color: 'var(--text-secondary)' }}
              >
                A modern documentation framework built for speed and flexibility. 
                Create beautiful docs in minutes with zero configuration.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Star className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 
                className="font-semibold mb-4"
                style={{ color: 'var(--text)' }}
              >
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                {['Documentation', 'Features', 'Plugins', 'Themes'].map((item) => (
                  <li key={item}>
                    <a 
                      href="/docs" 
                      className="transition-colors hover:text-accent"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 
                className="font-semibold mb-4"
                style={{ color: 'var(--text)' }}
              >
                Resources
              </h4>
              <ul className="space-y-3 text-sm">
                {['API Reference', 'Examples', 'Blog', 'Community'].map((item) => (
                  <li key={item}>
                    <a 
                      href="/docs" 
                      className="transition-colors hover:text-accent"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div 
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            style={{ 
              borderTop: '1px solid var(--border)',
              color: 'var(--text-muted)'
            }}
          >
            <p>© {new Date().getFullYear()} Simpli Framework. Built with ❤️</p>
            <div className="flex items-center gap-6">
              <a href="/docs" className="hover:text-accent transition-colors">Privacy</a>
              <a href="/docs" className="hover:text-accent transition-colors">Terms</a>
              <a href="/docs" className="hover:text-accent transition-colors">License</a>
            </div>
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
