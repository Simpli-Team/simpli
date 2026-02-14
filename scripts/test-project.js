#!/usr/bin/env node
// ============================================================================
// Test script for Simpli Framework
// ============================================================================

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_DIR_NAME = 'test-simpli-project';
const TEST_DIR = path.join(ROOT_DIR, TEST_DIR_NAME);
const TEST_TIMEOUT = 60000;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function cleanup() {
  log('\n🧹 Cleaning up...', 'blue');
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    log('  ✅ Cleanup complete');
  }
}

function runTest(name, fn) {
  log(`\n🧪 ${name}`, 'blue');
  try {
    fn();
    log(`  ✅ Passed`, 'green');
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

// Main test suite
async function main() {
  log('🚀 Starting Simpli Framework Tests', 'blue');
  log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  // Cleanup before start
  cleanup();
  
  // Test 1: Create project
  if (runTest('Create project with default template', () => {
    const createCli = path.join(ROOT_DIR, 'packages/create-simpli/bin/create-simpli.js');
    // Use relative name and specify cwd
    execSync(`node "${createCli}" "${TEST_DIR_NAME}" --template default --skip-install`, {
      stdio: 'pipe',
      timeout: TEST_TIMEOUT,
      cwd: ROOT_DIR,
    });
    if (!fs.existsSync(TEST_DIR)) {
      throw new Error('Project directory not created');
    }
  })) passed++; else failed++;
  
  // Test 2: Check project structure
  if (runTest('Check project structure', () => {
    const requiredFiles = [
      'package.json',
      'simpli.config.ts',
      'vite.config.ts',
      'tsconfig.json',
      'docs/intro.mdx',
      'docs/getting-started.mdx',
    ];
    for (const file of requiredFiles) {
      const filePath = path.join(TEST_DIR, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing ${file}`);
      }
    }
  })) passed++; else failed++;
  
  // Test 3: Check config syntax
  if (runTest('Check config syntax', () => {
    const configPath = path.join(TEST_DIR, 'simpli.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    if (!content.includes('defineConfig')) {
      throw new Error('Config does not use defineConfig');
    }
    if (!content.includes('simpli-docs')) {
      throw new Error('Config does not import from simpli-docs');
    }
  })) passed++; else failed++;
  
  // Test 4: Validate package.json
  if (runTest('Validate package.json', () => {
    const pkgPath = path.join(TEST_DIR, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    // Check simpli-docs in devDependencies (as per template)
    if (!pkg.devDependencies?.['simpli-docs']) {
      throw new Error('Missing simpli-docs in devDependencies');
    }
    if (!pkg.scripts?.dev) {
      throw new Error('Missing dev script');
    }
    if (!pkg.scripts?.build) {
      throw new Error('Missing build script');
    }
  })) passed++; else failed++;
  
  // Test 5: Check no blog references
  if (runTest('Verify no blog references', () => {
    const configPath = path.join(TEST_DIR, 'simpli.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    if (content.toLowerCase().includes('blog')) {
      throw new Error('Config contains blog references');
    }
    // Check no blog directory exists
    if (fs.existsSync(path.join(TEST_DIR, 'blog'))) {
      throw new Error('Blog directory should not exist');
    }
  })) passed++; else failed++;
  
  // Test 6: Check navbar items
  if (runTest('Check navbar configuration', () => {
    const configPath = path.join(TEST_DIR, 'simpli.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    if (!content.includes('search')) {
      throw new Error('Navbar missing search');
    }
    if (!content.includes('themeToggle')) {
      throw new Error('Navbar missing themeToggle');
    }
  })) passed++; else failed++;
  
  // Test 7: Check vite.config.ts
  if (runTest('Check vite.config.ts', () => {
    const vitePath = path.join(TEST_DIR, 'vite.config.ts');
    const content = fs.readFileSync(vitePath, 'utf-8');
    if (!content.includes('simpliPlugin')) {
      throw new Error('vite.config.ts missing simpliPlugin');
    }
    if (!content.includes('simpli-docs/vite')) {
      throw new Error('vite.config.ts not importing from simpli-docs/vite');
    }
  })) passed++; else failed++;
  
  // Summary
  log('\n' + '='.repeat(50));
  log('📊 Test Results:', 'blue');
  log(`  ✅ Passed: ${passed}`, 'green');
  log(`  ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  
  // Cleanup
  cleanup();
  
  if (failed > 0) {
    process.exit(1);
  }
  
  log('\n🎉 All tests passed!', 'green');
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  cleanup();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught error: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});

main().catch((error) => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});
