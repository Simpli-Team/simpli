#!/usr/bin/env node
// ============================================================================
// Build script for Simpli Framework packages
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');

// Copy directory recursively
function copyDir(src, dest, options = {}) {
  const { exclude = [] } = options;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, options);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean directory
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Main build process
async function build() {
  console.log('═══════════════════════════════════════════');
  console.log('  Building Simpli Framework Packages');
  console.log('═══════════════════════════════════════════\n');

  // 1. Build shared package
  console.log('📦 Building @simpli/shared...');
  try {
    execSync('npm run build', {
      cwd: path.join(packagesDir, 'shared'),
      stdio: 'inherit',
    });
    console.log('✅ @simpli/shared built successfully\n');
  } catch (error) {
    console.error('❌ Failed to build @simpli/shared');
    process.exit(1);
  }

  // 2. Prepare simpli-framework
  console.log('📦 Preparing simpli-framework...');
  const frameworkSrc = path.join(rootDir, 'src');
  const frameworkDest = path.join(packagesDir, 'simpli-framework', 'src');
  
  cleanDir(frameworkDest);
  copyDir(frameworkSrc, frameworkDest, {
    exclude: ['**/*.test.ts', '**/*.test.tsx', '__tests__']
  });
  console.log('✅ Source files copied\n');

  // 3. Build simpli-framework
  console.log('🔨 Building simpli-framework...');
  try {
    execSync('npm run build', {
      cwd: path.join(packagesDir, 'simpli-framework'),
      stdio: 'inherit',
    });
    console.log('✅ simpli-framework built successfully\n');
  } catch (error) {
    console.error('❌ Failed to build simpli-framework');
    process.exit(1);
  }

  // 4. Build create-simpli
  console.log('📦 Preparing create-simpli...');
  try {
    execSync('npm install', {
      cwd: path.join(packagesDir, 'create-simpli'),
      stdio: 'inherit',
    });
    console.log('✅ create-simpli ready\n');
  } catch (error) {
    console.error('❌ Failed to prepare create-simpli');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════');
  console.log('  All packages built successfully!');
  console.log('═══════════════════════════════════════════');
}

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
