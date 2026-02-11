# 📋 Implementation Phases

## Phase 1: Foundation (Core Engine) ⏱️ ~3-4 days ✅ COMPLETE

### 1.1 Project Setup
- [x] Install all dependencies (see SKILL.md tech stack table)
- [x] Configure `vite.config.ts` with React plugin, Tailwind CSS 4, Simpli plugin
- [ ] Set up `tsconfig.json` with strict mode, path aliases (`@core/*`, `@theme/*`, `@plugins/*`)
- [ ] Configure ESLint + Prettier
- [ ] Set up project directory structure as defined in SKILL.md

### 1.2 Config System
- [ ] Define `SimpliConfig` TypeScript interface (see 05-configuration.md)
- [ ] Create `defineConfig()` helper with type inference
- [ ] Build config loader (`src/core/config/loader.ts`)
  - Load `simpli.config.ts` from project root
  - Merge with defaults (`src/core/config/defaults.ts`)
  - Validate required fields
  - Environment variable substitution
- [ ] Create Vite virtual module: `virtual:simpli/config`

### 1.3 Virtual Module System
- [ ] Create `src/core/vite/plugin.ts` - Main Simpli Vite plugin
- [ ] Create `src/core/vite/virtualModules.ts`
  - `virtual:simpli/config` → Serialized site config
  - `virtual:simpli/routes` → Generated route manifest
  - `virtual:simpli/sidebar` → Sidebar navigation tree
  - `virtual:simpli/search` → Search index data
  - `virtual:simpli/metadata` → All docs metadata
- [ ] Hot reload: watch config file and invalidate virtual modules

### 1.4 Radix Tree Router
- [ ] Implement `RadixRouter` class (`src/core/router/RadixRouter.ts`)
  - Insert routes with O(k) complexity
  - Match paths with parameter extraction (`:slug`, `*`)
  - Support catch-all routes (`[...path]`)
- [ ] Create `RouteGenerator` (`src/core/router/RouteGenerator.ts`)
  - Scan `docs/` directory for MDX files
  - Generate routes from file structure
  - Respect frontmatter `slug` overrides
- [ ] Integrate with React Router v7
  - Create `<SimpliRouter>` wrapper component
  - Lazy loading with `React.lazy()` + `Suspense`
  - Route transition animations

### 1.5 MDX Pipeline
- [ ] Configure `@mdx-js/rollup` in Vite plugin
- [ ] Set up remark plugin chain (see 03-content-pipeline.md)
- [ ] Set up rehype plugin chain
- [ ] Create `FrontmatterParser` with gray-matter
- [ ] Create custom remark plugin for admonitions (`::: note/tip/warning`)
- [ ] Create custom rehype plugin for Shiki syntax highlighting
- [ ] Create MDX component mapping (`<a>`, `<code>`, `<pre>`, `<table>`, etc.)

---

## Phase 2: Theme & Components ⏱️ ~3-4 days

### 2.1 Design System Setup
- [ ] Configure Tailwind CSS 4 with CSS-first approach
- [ ] Define CSS custom properties in `theme.css`:
  - Colors (primary, secondary, background, text, border)
  - Typography (font family, sizes, weights, line heights)
  - Spacing scale, border radius, shadows
  - Dark mode variants via `@media (prefers-color-scheme: dark)` and `.dark` class
- [ ] Set up Google Font (Inter) loading
- [ ] Create `prose.css` for MDX content typography
- [ ] Create `animations.css` with micro-animations

### 2.2 Layout Components
- [ ] **Layout Shell** - Main app wrapper with sidebar + content + TOC grid
- [ ] **Navbar** - Sticky top bar with glassmorphism, responsive
- [ ] **Sidebar** - Collapsible navigation tree with active tracking
- [ ] **Footer** - Multi-column links layout
- [ ] **Breadcrumb** - Auto-generated from route path
- [ ] **Pagination** - Prev/Next document navigation

### 2.3 Content Components
- [ ] **CodeBlock** - Shiki integration with copy, line numbers, highlights
- [ ] **Admonition** - Note/Tip/Warning/Danger boxes with icons
- [ ] **Tabs** - Synchronized tabbed content with localStorage
- [ ] **Details** - Collapsible `<details>` with animation
- [ ] **Card/DocCard** - Link cards for category pages
- [ ] **Badge** - Status indicators (NEW, BETA, DEPRECATED)

### 2.4 Interactive Components
- [ ] **ThemeToggle** - Light/Dark/System mode switcher
- [ ] **TOC** - Table of contents with scroll spy
- [ ] **CopyButton** - Code copy with clipboard API

### 2.5 Theme Hooks
- [ ] `useTheme()` - Color mode management
- [ ] `useSidebar()` - Sidebar expand/collapse state
- [ ] `useToc()` - Extract and track table of contents
- [ ] `useScrollSpy()` - Active heading detection
- [ ] `useMediaQuery()` - Responsive breakpoint detection

### 2.6 Responsive Design
- [ ] Mobile: hamburger menu, full-screen sidebar overlay
- [ ] Tablet: collapsible sidebar, hidden TOC
- [ ] Desktop: full layout with sidebar + content + TOC
- [ ] Test all breakpoints

---

## Phase 3: Plugin System ⏱️ ~2-3 days

### 3.1 Plugin Infrastructure
- [ ] Define `SimpliPlugin` interface (see 02-plugin-system.md)
- [ ] Create `PluginManager` class with lifecycle management
- [ ] Create `HookRegistry` with tap/call/waterfall patterns
- [ ] Plugin ordering and priority system
- [ ] Plugin validation and error handling

### 3.2 Built-in Plugins
- [ ] **content-docs**: Documentation content loader
  - File discovery and watching
  - Sidebar auto-generation from file structure
  - Category metadata (`_category_.json`)
  - Doc metadata extraction
  - Route registration
- [ ] **content-blog**: Blog content loader
  - Blog post listing with pagination
  - Tag system and tag pages
  - Author support
  - RSS/Atom feed generation
  - Blog archive page
- [ ] **search-local**: FlexSearch integration
  - Build-time index generation
  - Runtime lazy index loading
  - Search result ranking and highlighting
  - Search analytics (popular queries)

### 3.3 Utility Plugins
- [ ] **sitemap**: Generate `sitemap.xml` at build time
- [ ] **analytics**: Google Analytics / Plausible integration

---

## Phase 4: Advanced Features ⏱️ ~2-3 days

### 4.1 Search Modal (⌘K)
- [ ] Full-screen modal with backdrop blur
- [ ] FlexSearch query with debounce
- [ ] Keyboard navigation (↑↓ Enter Esc)
- [ ] Result preview with matched text highlights
- [ ] Recent searches in localStorage
- [ ] Category grouping (Docs, Blog, API)
- [ ] "No results" state with suggestions

### 4.2 Versioning System
- [ ] Version configuration in `simpli.config.ts`
- [ ] Version dropdown component
- [ ] Version-prefixed routes (`/docs/2.0/guide`)
- [ ] Cross-version navigation (same page, different version)
- [ ] "Next" (unreleased) version handling

### 4.3 Internationalization (i18n)
- [ ] Locale configuration
- [ ] Locale-prefixed routes (`/th/docs/guide`)
- [ ] Locale switcher dropdown
- [ ] Content fallback (missing translation → default locale)
- [ ] RTL layout support

### 4.4 Diagrams & Rich Content
- [ ] **Mermaid** - Lazy-loaded diagram rendering
- [ ] **APITable** - Auto-formatted API reference tables
- [ ] **ExportPDF** - Print-friendly stylesheet + export button
- [ ] **Math/KaTeX** - LaTeX equation rendering (optional plugin)

### 4.5 Progressive Web App
- [ ] Service worker for offline access
- [ ] App manifest
- [ ] Install prompt
- [ ] Cache strategies for docs content

---

## Phase 5: CLI & Developer Experience ⏱️ ~2 days

### 5.1 CLI Tool
- [ ] `npx simpli create <project>` - Project scaffolding
  - Template selection (minimal, full, blog)
  - Interactive prompts (project name, features)
  - Git init + first commit
- [ ] `simpli dev` - Start dev server (wrapper around Vite)
- [ ] `simpli build` - Production build
- [ ] `simpli serve` - Serve production build locally
- [ ] `simpli clear` - Clear cache and generated files

### 5.2 Developer Tools
- [ ] Enhanced error overlay with context
- [ ] Build performance report
- [ ] Bundle size analysis command
- [ ] Broken links checker (build-time warning)
- [ ] Unused images/assets detector

---

## Phase 6: Optimization & Polish ⏱️ ~2 days

### 6.1 Performance
- [ ] Route-based code splitting (lazy imports)
- [ ] Component-based splitting (Mermaid, Shiki loaded on demand)
- [ ] Image optimization (responsive `<img>` with `srcset`)
- [ ] Font loading strategy (`font-display: swap`, preload)
- [ ] CSS purging via Tailwind CSS
- [ ] Preload/prefetch for navigation
- [ ] Target: Lighthouse 100/100/100/100

### 6.2 Bundle Optimization
- [ ] Manual chunks (react-vendor, router, mdx, search, highlight)
- [ ] Tree-shaking verification
- [ ] Unused dependency audit
- [ ] Target: < 50KB gzipped JS bundle

### 6.3 SEO
- [ ] Auto `<meta>` tags from frontmatter
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Canonical URLs
- [ ] Structured data (JSON-LD)
- [ ] Auto sitemap generation

### 6.4 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation throughout
- [ ] Screen reader testing
- [ ] Focus management on route change
- [ ] Skip to content link
- [ ] Color contrast verification

### 6.5 Final Polish
- [ ] Smooth page transition animations
- [ ] Loading states and skeletons
- [ ] Error boundaries with friendly messages
- [ ] 404 page design
- [ ] Documentation for Simpli itself (dogfooding)
- [ ] README.md with badges, screenshots, quick start

---

## Dependencies Install Command

```bash
# Core dependencies
npm install react@^19.2.0 react-dom@^19.2.0 react-router@^7.13.0 \
  @mdx-js/react@^3.1.1 zustand@^5.0.11 flexsearch@^0.8.212 \
  lucide-react@^0.475.0 clsx@^2.1.1 motion@^12.0.0 gray-matter@^4.0.3

# Dev dependencies
npm install -D @vitejs/plugin-react@^5.1.1 vite@^7.3.1 typescript@~5.9.3 \
  @mdx-js/rollup@^3.1.1 @tailwindcss/vite@^4.1.18 tailwindcss@^4.1.18 \
  babel-plugin-react-compiler@^1.0.0 \
  shiki@^3.22.0 \
  remark-gfm@^4.0.0 remark-directive@^4.0.0 \
  rehype-slug@^6.0.0 rehype-autolink-headings@^7.1.0 \
  @types/react@^19.2.7 @types/react-dom@^19.2.3 @types/node@^24.10.1 \
  eslint@^9.39.1 @eslint/js@^9.39.1 \
  eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.4.24 \
  globals@^16.5.0 typescript-eslint@^8.48.0
```
