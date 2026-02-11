# 🎨 UI Components

## Component Architecture

ทุก component ใช้ patterns:
- **React 19** + React Compiler (auto memoization)
- **Tailwind CSS 4** (CSS-first configuration)
- **Motion** (framer-motion v12) for animations
- **Lucide React** for icons
- **Accessible** (ARIA, keyboard navigation)

---

## Core Layout Components

### 1. Layout Shell
```
┌──────────────────────────────────────────┐
│  Navbar (fixed top)                      │
├──────┬────────────────────────┬──────────┤
│      │                        │          │
│ Side │     Main Content       │   TOC    │
│ bar  │     (MDX rendered)     │ (right)  │
│      │                        │          │
├──────┴────────────────────────┴──────────┤
│  Footer                                  │
└──────────────────────────────────────────┘
```

### 2. Navbar
- Sticky top with glassmorphism (`backdrop-blur`)
- Logo + title (left)
- Navigation links (center)
- Search trigger (⌘K), Theme toggle, GitHub link (right)
- Mobile: hamburger menu with slide-in drawer
- Version dropdown when versioning enabled
- Progress bar on scroll

### 3. Sidebar
- Collapsible categories with smooth animation
- Active item highlighting with indicator bar
- Keyboard navigation (↑↓ arrows)
- Auto-scroll to active item
- Mobile: slide-in overlay with backdrop
- Resizable width (drag handle)
- Badge support on items (e.g., "NEW", "BETA")

### 4. Table of Contents (TOC)
- Auto-extracted from H2/H3 headings
- Scroll spy: highlights active section
- Smooth scroll to heading on click
- Indentation for heading hierarchy
- Sticky positioning

### 5. Footer
- Multi-column links layout
- Copyright text
- Social media links
- "Built with Simpli" badge

---

## Content Components

### 6. CodeBlock (Shiki)
Features:
- VS Code-quality syntax highlighting (200+ languages)
- Dual theme (auto light/dark)
- Line highlighting: `{1,3-5}` 
- Line numbers toggle
- Title bar with language badge
- Copy button with success feedback
- Diff view (`// [!code ++]` / `// [!code --]`)
- Word highlighting
- Collapsible long blocks

### 7. Admonition
Types: `note`, `tip`, `info`, `warning`, `danger`, `caution`
```md
:::tip[Pro Tip]
This is a helpful tip!
:::
```
- Icon per type (Lucide)
- Color-coded borders and backgrounds
- Collapsible option
- Custom titles

### 8. Tabs
- Synchronized across page (same group key)
- Persist selection in localStorage
- Keyboard accessible (← → arrows)
- Animated underline indicator
- Support for: code tabs, platform tabs (npm/yarn/pnpm)

### 9. Details (Collapsible)
- `<summary>` with expand/collapse animation
- Chevron icon rotation
- Nested details support

### 10. Card / DocCard
- Link card with icon, title, description
- Grid layout for category pages
- Hover effect with subtle lift animation

### 11. Mermaid Diagrams
- Lazy-loaded (heavy dependency)
- Dark/Light theme auto-switch
- Zoom on click
- Copy as SVG/PNG

### 12. APITable
- Auto-formatted API reference
- Props table with types, defaults, descriptions
- Required field indicators
- Expandable rows for complex types

---

## Interactive Components

### 13. SearchModal (⌘K / Ctrl+K)
- Full-text search powered by FlexSearch
- Keyboard navigation (↑↓ Enter Esc)
- Search result preview with highlighted matches
- Recent searches memory
- Category grouping (Docs, Blog, API)
- Animated modal with backdrop blur
- Open with keyboard shortcut or click

### 14. ThemeToggle
- Three states: Light → Dark → System
- Smooth transition animation
- Persisted in localStorage + respects OS preference
- CSS custom properties for theming

### 15. VersionDropdown
- Dropdown showing available doc versions
- Current version badge
- "Next" (unreleased) indicator
- Redirect to same page in different version

### 16. Breadcrumb
- Auto-generated from route
- Current page (not linked)
- Separator icon (chevron)

### 17. Pagination (Prev/Next)
- Previous/Next doc navigation
- Card-like design with arrow icons
- Shows doc title + category
- Customizable via frontmatter

### 18. CopyButton
- Attached to code blocks
- Clipboard API
- Success/error feedback animation
- Tooltip

### 19. Badge
- Status indicators: `NEW`, `BETA`, `DEPRECATED`
- Color variants
- Inline or sidebar usage

### 20. ExportPDF
- Export current page or full docs as PDF
- Uses browser print API with custom print styles
- Table of contents in PDF
- Code blocks with proper formatting

---

## Animation Guidelines (Motion v12)

```typescript
// Standard transitions
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };
const slideUp = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } };

// Use layout animations for sidebar collapse
// Use AnimatePresence for route transitions  
// Use spring physics: { type: "spring", stiffness: 300, damping: 30 }
// Keep durations short: 150-300ms for micro-interactions

// Respect motion preferences:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | No sidebar, no TOC, hamburger menu |
| Tablet | 768-1023px | Collapsible sidebar, no TOC |
| Desktop | 1024-1279px | Sidebar + content (no TOC) |
| Wide | ≥ 1280px | Sidebar + content + TOC |
