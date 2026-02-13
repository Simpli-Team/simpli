#!/usr/bin/env node
/**
 * Simpli Framework - Static Site Generation (SSG) Script
 * 
 * This script generates static HTML files for all content routes.
 * It runs after the Vite build to create HTML files that can be served
 * without server-side routing configuration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const docsDir = path.resolve(rootDir, 'docs');
const blogDir = path.resolve(rootDir, 'blog');

// Route definition
interface Route {
  path: string;
  filePath?: string;
  title?: string;
  description?: string;
}

/**
 * Discover all content files in a directory
 */
function discoverContentFiles(dir: string, extensions: string[] = ['.mdx', '.md']): string[] {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext) && !entry.name.startsWith('_')) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files.sort();
}

/**
 * Convert file path to URL path
 */
function fileToRoute(filePath: string, contentDir: string, basePath: string): Route {
  const relativePath = path.relative(contentDir, filePath);
  const ext = path.extname(relativePath);
  const nameWithoutExt = relativePath.slice(0, -ext.length);

  // Convert to URL path
  let urlPath = nameWithoutExt
    .split(path.sep)
    .map(segment => {
      // Strip numeric prefix: 01-intro → intro
      const match = segment.match(/^\d+-(.+)$/);
      return match ? match[1] : segment;
    })
    .join('/');

  // Handle index files
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.slice(0, -6);
  } else if (urlPath === 'index') {
    urlPath = '';
  }

  const fullPath = basePath + (urlPath ? `/${urlPath}` : '');

  return {
    path: fullPath || basePath,
    filePath: filePath.replace(/\\/g, '/'),
  };
}

/**
 * Generate routes from content directories
 */
function generateRoutes(): Route[] {
  const routes: Route[] = [
    // Root route
    { path: '/', title: 'Simpli Documentation', description: 'Lightweight, blazing-fast documentation framework' },
    // Docs index
    { path: '/docs', title: 'Documentation', description: 'Explore Simpli documentation' },
    // Blog index
    { path: '/blog', title: 'Blog', description: 'Latest updates and articles' },
  ];

  // Discover docs routes
  if (fs.existsSync(docsDir)) {
    const docFiles = discoverContentFiles(docsDir);
    for (const file of docFiles) {
      const route = fileToRoute(file, docsDir, '/docs');
      // Extract title from frontmatter if possible
      const content = fs.readFileSync(file, 'utf-8');
      const titleMatch = content.match(/^title:\s*["']?(.+?)["']?$/m);
      const descMatch = content.match(/^description:\s*["']?(.+?)["']?$/m);
      routes.push({
        ...route,
        title: titleMatch?.[1] || route.path,
        description: descMatch?.[1],
      });
    }
  }

  // Discover blog routes
  if (fs.existsSync(blogDir)) {
    const blogFiles = discoverContentFiles(blogDir);
    for (const file of blogFiles) {
      const route = fileToRoute(file, blogDir, '/blog');
      const content = fs.readFileSync(file, 'utf-8');
      const titleMatch = content.match(/^title:\s*["']?(.+?)["']?$/m);
      const descMatch = content.match(/^description:\s*["']?(.+?)["']?$/m);
      routes.push({
        ...route,
        title: titleMatch?.[1] || route.path,
        description: descMatch?.[1],
      });
    }
  }

  return routes;
}

/**
 * Calculate relative path from a route to the root
 */
function getRelativePrefix(routePath: string): string {
  const depth = routePath.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

/**
 * Generate HTML for a route
 */
function generateHTML(template: string, route: Route): string {
  const prefix = getRelativePrefix(route.path);
  
  // Replace asset paths with relative paths
  let html = template
    .replace(/href="\/favicon\.svg"/g, `href="${prefix}favicon.svg"`)
    .replace(/src="\/src\/main\.tsx"/g, `src="${prefix}assets/index-h7hqpxUC.js"`)
    // Add base tag for proper relative URL resolution
    .replace('<head>', `<head>\n  <base href="${route.path === '/' ? '/' : route.path + '/'}">`);

  // Update meta tags
  const title = route.title || 'Simpli Documentation';
  const description = route.description || 'Lightweight, blazing-fast documentation framework';
  
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/content="Lightweight, blazing-fast documentation framework"/, `content="${description}"`);

  return html;
}

/**
 * Write HTML file for a route
 */
function writeRouteHTML(route: Route, html: string): void {
  // Determine output path
  const relativePath = route.path === '/' ? '' : route.path;
  const outputPath = path.join(distDir, relativePath);
  
  // Create directory if needed
  if (relativePath) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Write index.html
  const htmlPath = path.join(outputPath || distDir, 'index.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  
  // Generated silently
}

/**
 * Get the actual JS entry file from dist/assets
 */
function findEntryJS(): string | null {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return null;
  
  const files = fs.readdirSync(assetsDir);
  const entryFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  return entryFile || null;
}

/**
 * Update template with correct asset paths
 */
function updateTemplateWithAssets(template: string): string {
  const entryJS = findEntryJS();
  if (entryJS) {
    // Replace the src path with the correct asset path
    template = template.replace(
      /src="\/src\/main\.tsx"/,
      `src="/assets/${entryJS}"`
    );
  }
  return template;
}

/**
 * Main prerender function
 */
async function prerender(): Promise<void> {
  // Silent mode - only show errors

  // Check dist exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Read the template (original index.html from dist)
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  let template = fs.readFileSync(templatePath, 'utf-8');
  template = updateTemplateWithAssets(template);

  // Generate routes
  const routes = generateRoutes();
  // Generate routes silently

  // Generate HTML for each route
  for (const route of routes) {
    const html = generateHTML(template, route);
    writeRouteHTML(route, html);
  }

  // SSG complete - silent
}

// Run prerender
prerender().catch(err => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
