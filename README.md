<div align="center">
  <img src="public/simpli-logo.png" alt="Simpli Logo" width="200" />
  <br />
  <h1>🚀 Simpli Docs</h1>
  <p><strong>The Next-Generation Documentation Framework</strong></p>
  <p>Built for speed, designed for beauty. Powered by <strong>React 19</strong>, <strong>Vite 7</strong>, and <strong>Tailwind CSS 4</strong>.</p>
  
  [![npm version](https://img.shields.io/npm/v/simpli-docs.svg)](https://www.npmjs.com/package/simpli-docs)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Writing Content](#-writing-content)
- [CLI Reference](#-cli-reference)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Contributing](#-contributing)

---

## ✨ Features

- **⚡ Lightning Fast**: Powered by **Vite 7**, featuring instant server start (<100ms) and lightning-fast HMR (<10ms).
- **🎨 Modern Styling**: Built with **Tailwind CSS v4** for a utility-first, fully customizable design system.
- **⚛️ React 19 Core**: Leverage the latest React features, including the new React Compiler for automatic optimization.
- **📝 MDX Powered**: Write content in Markdown mixed with React components. Interactive documentation made easy.
- **🔍 Type-Safe Config**: Full TypeScript support with `defineConfig` for excellent DX and autocomplete.
- **🌍 Advanced Typography**: First-class support for various font families including **Thai fonts** (`Prompt`, `Sarabun`, `Kanit`) and Google Fonts.
- **📱 Mobile First**: Responsive glassmorphism design that looks stunning on any device.
- **🔦 Built-in Search**: Integrated local search with highlighting.
- **🌙 Dark Mode**: Automatic theme switching with system preference respect.
- **🛠️ Production Ready**: Comprehensive error handling, validation, and logging.

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, pnpm, or bun

### Create a New Site

```bash
# Using npm (recommended)
npm create simpli@latest my-docs

# Navigate to your project
cd my-docs

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Templates

| Template | Description |
|----------|-------------|
| `default` | Complete documentation site with search, dark mode, and all features |
| `minimal` | Bare minimum setup for simple documentation |

---

## 📁 Project Structure

```
my-docs/
├── docs/                      # Documentation files
│   ├── intro.mdx              # Introduction page
│   ├── getting-started.mdx    # Getting started guide
│   └── api/                   # API documentation
│       └── reference.mdx
├── src/
│   └── pages/                 # Custom React pages (optional)
│       └── 404.tsx            # Custom 404 page
├── public/                    # Static assets
│   ├── logo.svg
│   └── favicon.ico
├── simpli.config.ts           # Main configuration file
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

### Directory Explanation

| Directory | Purpose |
|-----------|---------|
| `docs/` | All your documentation content goes here. Supports `.md` and `.mdx` files. |
| `src/pages/` | Custom React pages that aren't part of the docs. |
| `public/` | Static assets that are served at the root URL. |
| `simpli.config.ts` | Main configuration file for your site. |
| `vite.config.ts` | Vite configuration - usually just imports the Simpli plugin. |

---

## ⚙️ Configuration

Simpli is highly configurable via `simpli.config.ts`:

```typescript
import { defineConfig } from 'simpli-docs';

export default defineConfig({
  // Site Metadata
  title: 'My Documentation',
  tagline: 'Documentation made simple',
  url: 'https://my-docs.dev',
  baseUrl: '/',
  favicon: '/favicon.ico',
  
  // Content Directories
  docsDir: 'docs',
  pagesDir: 'src/pages',
  staticDir: 'public',
  
  // Theme Configuration
  themeConfig: {
    // Font settings
    font: {
      family: 'inter', // or 'prompt', 'sarabun', 'kanit'
      weights: [400, 500, 600, 700],
    },
    
    // Navigation
    navbar: {
      title: 'My Project',
      items: [
        { label: 'Docs', to: '/docs', position: 'left' },
        { type: 'search', position: 'right' },
        { type: 'themeToggle', position: 'right' },
      ],
    },
    
    // Footer
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} My Project`,
    },
    
    // Search
    search: {
      enabled: true,
      provider: 'local',
    },
    
    // Color Mode
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  },
});
```

### Configuration Options

#### `title` (required)
The title of your documentation site. Displayed in the navbar and browser tab.

#### `tagline`
A short description of your site. Displayed below the title.

#### `url`
The full URL where your site will be deployed (e.g., `https://my-docs.dev`).

#### `baseUrl`
The base URL pathname (e.g., `/docs/` if deploying to a subdirectory).

#### `docsDir`
Directory containing your documentation files. Default: `docs`

#### `pagesDir`
Directory for custom React pages. Default: `src/pages`

#### `themeConfig`
Theme and UI configuration object.

---

## 📝 Writing Content

Simpli supports both **Markdown (`.md`)** and **MDX (`.mdx`)** files.

### Frontmatter

Each content file can include frontmatter for metadata:

```mdx
---
title: Getting Started
description: Learn how to use our product
sidebar_position: 1
sidebar_label: Quick Start
tags: [guide, setup]
---

# Getting Started

Your content here...
```

### Available Frontmatter Fields

| Field | Description |
|-------|-------------|
| `title` | Page title (required) |
| `description` | Page description for SEO |
| `sidebar_position` | Order in sidebar (number) |
| `sidebar_label` | Custom label for sidebar |
| `tags` | Array of tags |
| `draft` | Set to `true` to hide from production |
| `hideTitle` | Hide the page title |
| `hideTableOfContents` | Hide the TOC sidebar |

### Built-in Components

#### Admonitions

```mdx
<Admonition type="tip" title="Pro Tip">
  Use admonitions to highlight important information!
</Admonition>
```

Types: `note`, `tip`, `info`, `warning`, `danger`, `success`

#### Tabs

```mdx
<Tabs defaultValue="npm">
  <TabsList>
    <TabsTrigger value="npm">npm</TabsTrigger>
    <TabsTrigger value="yarn">yarn</TabsTrigger>
  </TabsList>
  <TabsContent value="npm">
    npm install my-package
  </TabsContent>
  <TabsContent value="yarn">
    yarn add my-package
  </TabsContent>
</Tabs>
```

#### Cards

```mdx
<CardGroup cols={2}>
  <Card 
    title="Quick Start" 
    href="/docs/intro"
    description="Get started in 5 minutes."
  />
  <Card 
    title="API Reference" 
    href="/docs/api"
    description="Complete API documentation."
  />
</CardGroup>
```

---

## 🛠️ CLI Reference

### Installation

```bash
npm install -g simpli-cli
# or use npx
npx simpli <command>
```

### Commands

| Command | Description | Options |
|---------|-------------|---------|
| `simpli create <name>` | Create a new project | `--template`, `--skip-install` |
| `simpli dev` | Start development server | `--port`, `--host`, `--open` |
| `simpli build` | Build for production | `--outDir`, `--skipTypeCheck` |
| `simpli serve` | Serve production build | `--port`, `--host` |
| `simpli clear` | Clear cache | - |
| `simpli doctor` | Check project health | - |

### Examples

```bash
# Start dev server on port 3000
npx simpli dev --port 3000 --open

# Build with custom output directory
npx simpli build --outDir build

# Check project health
npx simpli doctor
```

---

## 🏗️ Architecture

### System Overview

Simpli Docs consists of several integrated components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Simpli Docs Framework                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Config     │  │   Content    │  │    Theme     │      │
│  │   System     │  │   Pipeline   │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Router     │  │   Search     │  │   Plugin     │      │
│  │   System     │  │    Index     │  │   System     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   Vite Plugin  │
                    └───────┬───────┘
                            │
                    ┌───────┴───────┐
                    │  Build Output  │
                    └───────────────┘
```

### Content Pipeline

The content processing pipeline works as follows:

1. **Discovery**: Scan `docs/` directory for `.md` and `.mdx` files
2. **Parsing**: Extract frontmatter and content using gray-matter
3. **Processing**: Transform MDX, generate metadata, extract headings
4. **Indexing**: Build search index from content
5. **Routing**: Generate routes from file structure
6. **Rendering**: Render to static HTML at build time

### Configuration System

The configuration system uses a layered approach:

1. **Default Config**: Built-in defaults for all options
2. **User Config**: Your `simpli.config.ts` overrides defaults
3. **Validation**: Schema validation with helpful error messages
4. **Resolution**: Resolve relative paths to absolute paths

```typescript
// Configuration flow
Default Config → User Config → Validation → Path Resolution → Runtime Config
```

### Plugin System

Simpli supports a plugin architecture for extensibility:

```typescript
// Example plugin structure
const myPlugin = {
  name: 'my-plugin',
  
  // Transform content during build
  transformContent(content, filePath) {
    return content.replace(/TODO/g, 'DONE');
  },
  
  // Modify routes
  routesResolved(routes) {
    return routes;
  },
  
  // Run after build
  postBuild({ outDir }) {
    console.log(`Built to ${outDir}`);
  },
};
```

---

## 🌐 Deployment

### Static Hosting

Build your site:

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: Use GitHub Actions
- **Cloudflare Pages**: Connect your Git repo

### GitHub Pages Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/simpli-framework/simpli.git
cd simpli

# Install dependencies
npm install

# Build packages
npm run build:packages

# Start development
npm run dev
```

### Project Structure

```
packages/
├── @simpli/shared/          # Shared utilities (logger, validation, file utils)
├── simpli-cli/              # CLI tool
├── create-simpli/           # Project scaffolding
└── simpli-framework/        # Core framework
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MDX](https://mdxjs.com/) - Markdown for components

---

<p align="center">
  Built with ❤️ by the Simpli Team
</p>

<p align="center">
  <a href="https://simpli-docs.vercel.app">Documentation</a> •
  <a href="https://github.com/simpli-framework/simpli">GitHub</a> •
  <a href="https://www.npmjs.com/package/simpli-docs">npm</a>
</p>
