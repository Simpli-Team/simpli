import { Layout, Card, CardGroup, Admonition, Tabs, TabsList, TabsTrigger, TabsContent } from '../theme';

export default function HomePage() {
  return (
    <Layout showSidebar={false} showTOC={false}>
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--simpli-text)] mb-6">
          Simpli Framework
        </h1>
        <p className="text-xl md:text-2xl text-[var(--simpli-text-secondary)] max-w-2xl mx-auto mb-8">
          A lightweight, blazing-fast documentation framework built with React 19, 
          TypeScript 5.9, and Tailwind CSS 4.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/docs"
            className="px-6 py-3 bg-[var(--simpli-primary-600)] text-white rounded-lg font-medium hover:bg-[var(--simpli-primary-700)] transition-colors"
          >
            Get Started
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-[var(--simpli-border)] rounded-lg font-medium hover:bg-[var(--simpli-bg-secondary)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center text-[var(--simpli-text)] mb-12">
          Why Simpli?
        </h2>
        <CardGroup cols={3}>
          <Card
            title="Ultra-Fast"
            description="Cold start under 100ms with Vite 7 and instant HMR. Bundle size under 50KB gzipped."
            href="/docs/features"
          />
          <Card
            title="Zero Config"
            description="Convention over configuration. Works out of the box with sensible defaults."
            href="/docs/configuration"
          />
          <Card
            title="Type-Safe"
            description="Full TypeScript support with complete type inference in your config files."
            href="/docs/typescript"
          />
          <Card
            title="Modern Stack"
            description="Built with React 19, React Compiler, Tailwind CSS 4, and React Router v7."
            href="/docs/architecture"
          />
          <Card
            title="Plugin System"
            description="Extensible hook-based plugin system. Add custom features with ease."
            href="/docs/plugins"
          />
          <Card
            title="SEO Ready"
            description="Automatic sitemap generation, Open Graph tags, and JSON-LD structured data."
            href="/docs/seo"
          />
        </CardGroup>
      </section>

      {/* Quick Start */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center text-[var(--simpli-text)] mb-8">
          Quick Start
        </h2>
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="npm">
            <TabsList>
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="yarn">yarn</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            </TabsList>
            <TabsContent value="npm">
              <pre className="p-4 bg-[var(--simpli-bg-secondary)] rounded-lg overflow-x-auto">
                <code>npm create simpli@latest my-docs</code>
              </pre>
            </TabsContent>
            <TabsContent value="yarn">
              <pre className="p-4 bg-[var(--simpli-bg-secondary)] rounded-lg overflow-x-auto">
                <code>yarn create simpli my-docs</code>
              </pre>
            </TabsContent>
            <TabsContent value="pnpm">
              <pre className="p-4 bg-[var(--simpli-bg-secondary)] rounded-lg overflow-x-auto">
                <code>pnpm create simpli my-docs</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Admonition Example */}
      <section className="py-8">
        <Admonition type="tip" title="New Features">
          Simpli now supports React 19 with the React Compiler for automatic 
          memoization and improved performance!
        </Admonition>
      </section>
    </Layout>
  );
}
