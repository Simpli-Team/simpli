# Simpli Framework

> Lightweight, blazing-fast documentation framework powered by React 19, Vite 7, and Tailwind CSS 4.

## Features

- ⚡ **Lightning Fast** - Powered by Vite 7 with instant HMR
- 📝 **MDX Powered** - Write interactive documentation with Markdown + React
- 🎨 **Modern Design** - Beautiful glassmorphism theme with Tailwind CSS 4
- 🔍 **Built-in Search** - Local search with highlighting
- 🌙 **Dark Mode** - Automatic theme switching
- 🌍 **Thai Fonts** - First-class support for Thai typography
- 🔒 **Type Safe** - Full TypeScript support

## Quick Start

```bash
# Create a new project
npm create simpli@latest my-docs

# Navigate to project
cd my-docs

# Start development
npm run dev

# Build for production
npm run build

# Serve production build
npm run serve
```

## Configuration

Create `simpli.config.ts`:

```typescript
import { defineConfig } from 'simpli-docs';

export default defineConfig({
  title: 'My Documentation',
  tagline: 'Documentation made simple',
  url: 'https://mydocs.dev',
  
  themeConfig: {
    navbar: {
      title: 'My Project',
      items: [
        { label: 'Docs', to: '/docs', position: 'left' },
        { type: 'search', position: 'right' },
        { type: 'themeToggle', position: 'right' },
      ],
    },
  },
});
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `simpli dev` | Start development server |
| `simpli build` | Build for production |
| `simpli serve` | Serve production build |
| `simpli clear` | Clear cache and build files |
| `simpli create <name>` | Create new project |

## Documentation

Visit [https://simpli-docs.vercel.app](https://simpli-docs.vercel.app) for full documentation.

## License

MIT
