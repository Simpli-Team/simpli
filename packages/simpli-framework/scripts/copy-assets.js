#!/usr/bin/env node
// ============================================================================
// Copy assets from source to dist
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Copy CSS files
function copyCSSFiles() {
  const srcDir = path.join(rootDir, 'src', 'theme', 'styles');
  const destDir = path.join(distDir, 'theme', 'styles');
  
  if (!fs.existsSync(srcDir)) {
    console.log('No CSS files to copy');
    return;
  }
  
  fs.mkdirSync(destDir, { recursive: true });
  
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    if (file.endsWith('.css')) {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
    }
  }
}

// Copy bin files
function copyBinFiles() {
  const srcBinDir = path.join(rootDir, 'bin');
  const destBinDir = path.join(distDir, '..', 'bin');
  
  fs.mkdirSync(destBinDir, { recursive: true });
  
  const files = fs.readdirSync(srcBinDir);
  for (const file of files) {
    const src = path.join(srcBinDir, file);
    const dest = path.join(destBinDir, file);
    fs.copyFileSync(src, dest);
    fs.chmodSync(dest, 0o755);
    console.log(`Copied: bin/${file}`);
  }
}

// Main
console.log('Copying assets...');
try {
  copyCSSFiles();
  copyBinFiles();
  console.log('Done!');
} catch (error) {
  console.error('Error copying assets:', error);
  process.exit(1);
}
