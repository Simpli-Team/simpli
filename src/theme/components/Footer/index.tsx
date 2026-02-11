export function Footer() {
  return (
    <footer
      className="py-8 mt-12"
      style={{
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Simpli Framework. Built with ❤️
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/docs"
              className="nav-link text-sm"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
