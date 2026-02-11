# 🚀 Simpli Framework

[![Version](https://img.shields.io/npm/v/simpli-framework)](https://www.npmjs.com/package/simpli-framework)
[![License](https://img.shields.io/npm/l/simpli-framework)](LICENSE)

A lightweight, blazing-fast documentation framework built with **React 19**, **TypeScript 5.9**, **Tailwind CSS 4**, and **Vite 7**.

## ✨ Features

- ⚡ **Ultra-Fast**: Cold start under 100ms, HMR under 10ms
- 🎯 **Zero Config**: Convention over configuration
- 🔒 **Type-Safe**: Full TypeScript support with complete inference
- 🎨 **Modern Stack**: React 19 + React Compiler, Tailwind CSS 4
- 🔌 **Plugin System**: Extensible hook-based architecture
- 🔍 **Built-in Search**: Full-text search with FlexSearch
- 📱 **Responsive**: Mobile-first design
- 🌙 **Dark Mode**: Automatic dark mode support

## 🚀 Quick Start

### Create a new site

```bash
npm create simpli@latest my-docs
cd my-docs
npm run dev
```

### Manual Installation

```bash
npm install simpli-framework
```

## 📁 Project Structure

```
my-docs/
├── docs/                 # Documentation files (.mdx)
├── blog/                 # Blog posts (optional)
├── src/
│   └── pages/            # Custom pages
├── simpli.config.ts      # Site configuration
├── package.json
└── vite.config.ts
```

## ⚙️ Configuration

```typescript
import { defineConfig } from 'simpli-framework';

export default defineConfig({
  title: 'My Documentation',
  tagline: 'Documentation made simple',
  url: 'https://mydocs.dev',
  
  themeConfig: {
    navbar: {
      title: 'My Docs',
      items: [
        { label: 'Docs', to: '/docs' },
        { label: 'Blog', to: '/blog' },
      ],
    },
    sidebar: {
      hideable: true,
    },
    footer: {
      style: 'dark',
    },
    search: {
      enabled: true,
    },
  },
});
```

## 📝 Writing Content

Create MDX files in the `docs` folder:

```mdx
---
title: Getting Started
description: Learn how to use Simpli
---

# Getting Started

Welcome to Simpli!

:::tip[Pro Tip]
Use MDX for interactive documentation!
:::
```

## 🧩 Built-in Components

- `<Admonition>` - Note, tip, warning, danger boxes
- `<Tabs>` - Tabbed content
- `<CodeBlock>` - Syntax highlighted code
- `<Card>` - Link cards
- `<Details>` - Collapsible content

## 🛠️ CLI Commands

| Command | Description |
|---------|-------------|
| `simpli create <name>` | Create new project |
| `simpli dev` | Start dev server |
| `simpli build` | Build for production |
| `simpli serve` | Preview production build |
| `simpli clear` | Clear cache |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using Simpli Framework
