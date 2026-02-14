export function Footer() {
  return (
    <footer
      className="py-6 mt-16"
      style={{
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="Simpli Logo" 
                className="w-6 h-6"
              />
              <span 
                className="font-semibold"
                style={{ color: 'var(--text)' }}
              >
                Simpli
              </span>
            </div>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              © 2026 Simpli Teams
            </p>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="/docs"
              className="transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              Docs
            </a>
            <a
              href="/docs/api"
              className="transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              API
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
              style={{ color: 'var(--text-secondary)' }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
