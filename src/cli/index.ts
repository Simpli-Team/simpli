#!/usr/bin/env node
// ============================================================================
// Simpli CLI - Command Line Interface
// ============================================================================
// Provides commands: create, dev, build, serve, clear
// ============================================================================

import { resolve } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// CLI entry point

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
Simpli CLI - Documentation framework command line tool

Usage:
  npx simpli <command> [options]

Commands:
  create <name>     Create a new Simpli documentation site
  dev              Start development server
  build            Build for production
  serve            Serve production build
  clear            Clear cache and build files
  help             Show this help message

Options:
  --template       Template to use (default, minimal, blog)
  --skip-install   Skip npm install after creation

Examples:
  npx simpli create my-docs
  npx simpli create my-docs --template blog
  npx simpli dev
  npx simpli build
`);
}

async function main() {
  switch (command) {
    case 'create':
      await createCommand(args.slice(1));
      break;
    case 'dev':
      devCommand();
      break;
    case 'build':
      buildCommand();
      break;
    case 'serve':
      serveCommand();
      break;
    case 'clear':
      clearCommand();
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

async function createCommand(args: string[]) {
  const projectName = args[0];
  if (!projectName) {
    console.error('Error: Please specify a project name');
    console.log('  npx simpli create <name>');
    process.exit(1);
  }

  const template = args.includes('--template') 
    ? args[args.indexOf('--template') + 1] 
    : 'default';
  
  const skipInstall = args.includes('--skip-install');

  console.log(`Creating Simpli project: ${projectName}`);
  console.log(`Template: ${template}`);

  const targetDir = resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${projectName} already exists`);
    process.exit(1);
  }

  // Create directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Create project files
  createProjectFiles(targetDir, projectName, template);

  // Install dependencies
  if (!skipInstall) {
    console.log('Installing dependencies...');
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  }

  console.log(`\n✅ Successfully created ${projectName}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm run dev`);
}

function createProjectFiles(targetDir: string, projectName: string, template: string) {
  // package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@mdx-js/react': '^3.1.1',
      'clsx': '^2.1.1',
      'lucide-react': '^0.475.0',
      'react': '^19.2.4',
      'react-dom': '^19.2.4',
      'react-router': '^7.13.0',
      'zustand': '^5.0.11',
    },
    devDependencies: {
      '@mdx-js/rollup': '^3.1.1',
      '@tailwindcss/vite': '^4.1.18',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@vitejs/plugin-react': '^5.1.1',
      'babel-plugin-react-compiler': '^1.0.0',
      'gray-matter': '^4.0.3',
      'rehype-autolink-headings': '^7.1.0',
      'rehype-slug': '^6.0.0',
      'remark-directive': '^4.0.0',
      'remark-gfm': '^4.0.1',
      'shiki': '^3.22.0',
      'tailwindcss': '^4.1.18',
      'typescript': '~5.9.3',
      'vite': '^7.3.1',
    },
  };

  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // simpli.config.ts
  const simpliConfig = `import { defineConfig } from '@simpli/core';

export default defineConfig({
  title: '${projectName}',
  tagline: 'Documentation made simple',
  url: 'https://example.com',
  
  themeConfig: {
    navbar: {
      title: '${projectName}',
      items: [
        { label: 'Docs', to: '/docs', position: 'left' },
        ${template === 'blog' ? "{ label: 'Blog', to: '/blog', position: 'left' }," : ''}
      ],
    },
    footer: {
      style: 'dark',
      copyright: '© \${new Date().getFullYear()} ${projectName}',
    },
  },
});
`;

  fs.writeFileSync(path.join(targetDir, 'simpli.config.ts'), simpliConfig);

  // Create docs folder with intro
  fs.mkdirSync(path.join(targetDir, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(targetDir, 'docs', 'intro.mdx'),
    `---
title: Introduction
description: Welcome to ${projectName}
---

# Welcome to ${projectName}

This is your documentation site powered by Simpli.

## Getting Started

Edit \`docs/intro.mdx\` to customize this page.
`
  );

  // Create blog folder if template is blog
  if (template === 'blog') {
    fs.mkdirSync(path.join(targetDir, 'blog'), { recursive: true });
    fs.writeFileSync(
      path.join(targetDir, 'blog', 'welcome.mdx'),
      `---
title: Welcome
date: ${new Date().toISOString().split('T')[0]}
---

# Welcome to the Blog

This is your first blog post!
`
    );
  }
}

function devCommand() {
  console.log('Starting development server...');
  execSync('vite', { stdio: 'inherit' });
}

function buildCommand() {
  console.log('Building for production...');
  execSync('tsc -b && vite build', { stdio: 'inherit' });
}

function serveCommand() {
  console.log('Serving production build...');
  execSync('vite preview', { stdio: 'inherit' });
}

function clearCommand() {
  console.log('Clearing cache...');
  const dirs = ['.simpli', 'dist', 'build'];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  Removed ${dir}`);
    }
  }
  console.log('✅ Cache cleared');
}

main().catch(console.error);
