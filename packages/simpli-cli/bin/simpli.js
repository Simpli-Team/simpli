#!/usr/bin/env node
// ============================================================================
// Simpli CLI - Production Level Command Line Interface
// ============================================================================
// Consolidated CLI entry point - all CLI functionality lives here
// ============================================================================

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import cac from 'cac';

// Try to import from @simpli/shared, fallback to inline implementations
let logger, validators;
try {
  const shared = await import('@simpli/shared');
  logger = shared.logger;
  validators = shared;
} catch {
  // Fallback inline implementations
  logger = createFallbackLogger();
  validators = createFallbackValidators();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load package.json
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
} catch {
  pkg = { version: '0.1.0' };
}

// =============================================================================
// CLI Setup
// =============================================================================
const cli = cac('simpli');

cli.version(pkg.version).help();

// =============================================================================
// Helper Functions
// =============================================================================

function getViteBinary() {
  try {
    const vitePath = require.resolve('vite/bin/vite.js', { paths: [process.cwd()] });
    return vitePath;
  } catch {
    return 'vite';
  }
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0], 10);
  
  if (majorVersion < 18) {
    console.error(`❌ Node.js ${currentVersion} is not supported. Minimum required: v18.0.0`);
    process.exit(1);
  }
  
  return majorVersion;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirSizeSync(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      size += getDirSizeSync(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

function isEmptyDir(dirPath) {
  if (!fs.existsSync(dirPath)) return true;
  const files = fs.readdirSync(dirPath);
  return files.length === 0;
}

function removeDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Fallback implementations when @simpli/shared is not available
function createFallbackLogger() {
  const colors = {
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
  };
  
  return {
    newline: () => console.log(),
    section: (title) => {
      console.log();
      console.log(colors.cyan(colors.bold(title)));
      console.log(colors.cyan('─'.repeat(title.length)));
    },
    step: (n, total, msg) => console.log(`${colors.cyan(`[${n}/${total}]`)} ${msg}`),
    success: (msg) => console.log(`${colors.green('✔')} ${msg}`),
    error: (msg) => console.error(`${colors.red('✖')} ${msg}`),
    warn: (msg) => console.warn(`${colors.yellow('⚠')} ${msg}`),
    info: (msg) => console.log(`${colors.cyan('ℹ')} ${msg}`),
    plain: (msg) => console.log(msg),
    bold: (msg) => console.log(colors.bold(msg)),
    dim: (msg) => console.log(colors.dim(msg)),
  };
}

function createFallbackValidators() {
  return {
    validatePort: (port) => {
      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return { valid: false, errors: ['Invalid port number'], warnings: [] };
      }
      return { valid: true, errors: [], warnings: [] };
    },
    validateNodeVersion: () => ({ valid: true, errors: [], warnings: [] }),
  };
}

// =============================================================================
// Commands
// =============================================================================

// Dev command
cli
  .command('dev', 'Start development server')
  .option('--port <port>', 'Port to run dev server on', { default: 5173 })
  .option('--host', 'Allow external access')
  .option('--open', 'Open browser automatically')
  .option('--strictPort', 'Exit if port is already in use')
  .action(async (options) => {
    checkNodeVersion();
    
    logger.newline();
    logger.section('Development Server');

    const portValidation = validators.validatePort?.(options.port) || { valid: true, warnings: [] };
    if (!portValidation.valid) {
      portValidation.errors?.forEach(err => logger.error(err));
      process.exit(1);
    }
    portValidation.warnings?.forEach(warn => logger.warn(warn));

    try {
      const viteBin = getViteBinary();
      const args = [viteBin];
      
      if (options.port) args.push('--port', options.port.toString());
      if (options.host) args.push('--host');
      if (options.open) args.push('--open');
      if (options.strictPort) args.push('--strictPort');

      logger.info(`Starting Vite dev server on port ${options.port}...`);
      logger.newline();

      const child = spawn('node', args, { stdio: 'inherit', shell: true });

      child.on('exit', (code) => process.exit(code ?? 0));

      process.on('SIGINT', () => {
        logger.newline();
        logger.info('Shutting down development server...');
        child.kill('SIGINT');
      });
    } catch (error) {
      logger.error('Failed to start dev server: ' + error.message);
      process.exit(1);
    }
  });

// Build command
cli
  .command('build', 'Build for production')
  .option('--outDir <dir>', 'Output directory', { default: 'dist' })
  .option('--emptyOutDir', 'Empty output directory before building')
  .option('--skipTypeCheck', 'Skip TypeScript type checking')
  .action(async (options) => {
    checkNodeVersion();
    
    logger.newline();
    logger.section('Production Build');

    const startTime = Date.now();

    try {
      const hasViteConfig = fs.existsSync('vite.config.ts') || fs.existsSync('vite.config.js');
      if (!hasViteConfig) {
        logger.error('No vite.config.ts found. Are you in a Simpli project directory?');
        process.exit(1);
      }

      if (!options.skipTypeCheck && fs.existsSync('tsconfig.json')) {
        logger.step(1, 3, 'Running TypeScript check...');
        try {
          execSync('tsc --noEmit', { stdio: 'inherit' });
          logger.success('TypeScript check passed');
        } catch {
          logger.error('TypeScript check failed. Use --skipTypeCheck to skip.');
          process.exit(1);
        }
      } else {
        logger.step(1, 3, 'Skipping TypeScript check');
      }

      logger.step(2, 3, 'Building with Vite...');
      const viteBin = getViteBinary();
      const args = [viteBin, 'build', '--outDir', options.outDir];
      if (options.emptyOutDir) args.push('--emptyOutDir');

      execSync(`node ${args.join(' ')}`, { stdio: 'inherit' });
      logger.success('Vite build completed');

      logger.step(3, 3, 'Running post-build checks...');
      
      const outDirPath = path.resolve(options.outDir);
      if (fs.existsSync(outDirPath)) {
        const files = fs.readdirSync(outDirPath);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        
        if (htmlFiles.length === 0) {
          logger.warn('No HTML files found in output directory');
        } else {
          logger.success(`Generated ${htmlFiles.length} HTML file(s)`);
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.newline();
      logger.success(`Build completed in ${duration}s`);
      logger.plain(`Output: ${logger.bold ? '' : ''}${options.outDir}`);

    } catch (error) {
      logger.error('Build failed: ' + error.message);
      process.exit(1);
    }
  });

// Serve command
cli
  .command('serve', 'Serve production build')
  .alias('preview')
  .option('--port <port>', 'Port to serve on', { default: 4173 })
  .option('--host', 'Allow external access')
  .option('--open', 'Open browser automatically')
  .option('--outDir <dir>', 'Output directory to serve', { default: 'dist' })
  .action(async (options) => {
    checkNodeVersion();
    
    logger.newline();
    logger.section('Production Server');

    const outDirPath = path.resolve(options.outDir);
    if (!fs.existsSync(outDirPath)) {
      logger.error(`Output directory not found: ${options.outDir}`);
      logger.info('Run "simpli build" first to create a production build.');
      process.exit(1);
    }

    if (isEmptyDir(outDirPath)) {
      logger.error(`Output directory is empty: ${options.outDir}`);
      logger.info('Run "simpli build" first to create a production build.');
      process.exit(1);
    }

    try {
      const viteBin = getViteBinary();
      const args = [viteBin, 'preview', '--outDir', options.outDir, '--port', options.port.toString()];
      if (options.host) args.push('--host');
      if (options.open) args.push('--open');

      logger.info(`Serving production build from ${options.outDir}...`);
      logger.newline();

      const child = spawn('node', args, { stdio: 'inherit', shell: true });

      child.on('exit', (code) => process.exit(code ?? 0));

      process.on('SIGINT', () => {
        logger.newline();
        logger.info('Stopping server...');
        child.kill('SIGINT');
      });

    } catch (error) {
      logger.error('Failed to serve: ' + error.message);
      process.exit(1);
    }
  });

// Clear command
cli
  .command('clear', 'Clear cache and build files')
  .alias('clean')
  .action(() => {
    logger.newline();
    logger.section('Cleanup');

    const dirsToRemove = [
      { name: 'dist', description: 'Build output' },
      { name: 'dist-ssr', description: 'SSR build output' },
      { name: '.simpli', description: 'Simpli cache' },
      { name: '.cache', description: 'Vite cache' },
      { name: 'node_modules/.vite', description: 'Vite dependencies cache' },
    ];

    let removedCount = 0;
    let totalSize = 0;

    for (const { name, description } of dirsToRemove) {
      if (fs.existsSync(name)) {
        const size = getDirSizeSync(name);
        if (removeDir(name)) {
          logger.success(`Removed ${name} (${formatSize(size)}) - ${description}`);
          removedCount++;
          totalSize += size;
        }
      }
    }

    logger.newline();
    if (removedCount > 0) {
      logger.success(`Cleared ${removedCount} directories (${formatSize(totalSize)})`);
    } else {
      logger.info('Nothing to clear');
    }
    logger.newline();
  });

// Create command
cli
  .command('create <name>', 'Create a new Simpli project')
  .option('--template <template>', 'Template to use (default, minimal)')
  .option('--skip-install', 'Skip npm install')
  .option('--pm <packageManager>', 'Package manager to use (npm, yarn, pnpm, bun)')
  .action(async (name, options) => {
    logger.newline();
    logger.section('Create Project');

    try {
      const args = [name];
      if (options.template) args.push('--template', options.template);
      if (options.skipInstall) args.push('--skip-install');
      if (options.pm) args.push('--pm', options.pm);

      execSync(`npx create-simpli@latest ${args.join(' ')}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      logger.error('Failed to create project');
      process.exit(1);
    }
  });

// Doctor command
cli
  .command('doctor', 'Check project health and configuration')
  .action(async () => {
    checkNodeVersion();
    
    logger.newline();
    logger.section('Project Health Check');

    let issues = 0;
    let warnings = 0;

    logger.info('Checking Node.js version...');
    logger.success(`Node.js ${process.version}`);

    logger.info('Checking project files...');
    
    const requiredFiles = [
      { name: 'package.json', critical: true },
      { name: 'vite.config.ts', critical: true },
      { name: 'simpli.config.ts', critical: false },
      { name: 'tsconfig.json', critical: false },
    ];

    for (const { name, critical } of requiredFiles) {
      if (fs.existsSync(name)) {
        logger.success(`Found ${name}`);
      } else if (critical) {
        logger.error(`Missing ${name}`);
        issues++;
      } else {
        logger.warn(`Missing ${name}`);
        warnings++;
      }
    }

    logger.info('Checking dependencies...');
    if (fs.existsSync('node_modules')) {
      logger.success('node_modules exists');
    } else {
      logger.error('node_modules not found. Run "npm install" first.');
      issues++;
    }

    logger.info('Checking content directories...');
    if (fs.existsSync('docs')) {
      const docFiles = fs.readdirSync('docs');
      logger.success(`Found docs/ (${docFiles.length} files)`);
    } else {
      logger.warn('No docs/ directory found');
      warnings++;
    }

    logger.newline();
    if (issues === 0 && warnings === 0) {
      logger.success('All checks passed!');
    } else {
      if (issues > 0) logger.error(`${issues} issue(s) found`);
      if (warnings > 0) logger.warn(`${warnings} warning(s) found`);
    }
    logger.newline();
  });

// Parse and run
cli.parse();
