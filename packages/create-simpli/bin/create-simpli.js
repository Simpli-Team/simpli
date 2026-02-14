#!/usr/bin/env node
// ============================================================================
// Create Simpli CLI - Project Scaffolding
// ============================================================================

import { resolve } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import { 
  Logger,
  logger, 
  validateProjectName, 
  validateDirectory,
  validateTemplate,
  commandExists,
  copyDir,
  removeDir,
  ensureDir,
  cyan, 
  green, 
  red, 
  yellow, 
  bold,
} from '@simpli/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, '..', 'template');

const TEMPLATES = ['default', 'minimal'];
const PACKAGE_MANAGERS = [
  { name: 'npm', label: 'npm', command: 'npm install' },
  { name: 'yarn', label: 'Yarn', command: 'yarn' },
  { name: 'pnpm', label: 'pnpm', command: 'pnpm install' },
  { name: 'bun', label: 'Bun', command: 'bun install' },
];

const log = new Logger({ prefix: 'create-simpli' });

function showHelp() {
  console.log(`
${bold('Create Simpli')} - Scaffold new Simpli documentation sites

${bold('Usage:')}
  npm create simpli@latest [project-name] [options]

${bold('Options:')}
  --template, -t     Template to use (${TEMPLATES.join(', ')})
  --skip-install     Skip package installation
  --pm, -p           Package manager (npm, yarn, pnpm, bun)
  --help, -h         Show this help message

${bold('Examples:')}
  npm create simpli@latest my-docs
  npm create simpli@latest my-docs --template minimal
  npm create simpli@latest
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  let projectName = args.find(arg => !arg.startsWith('-'));
  
  const templateIndex = args.findIndex(arg => arg === '--template' || arg === '-t');
  let template = templateIndex !== -1 ? args[templateIndex + 1] : null;
  
  const pmIndex = args.findIndex(arg => arg === '--pm' || arg === '-p');
  let packageManager = pmIndex !== -1 ? args[pmIndex + 1] : null;
  
  const skipInstall = args.includes('--skip-install');

  log.newline();
  log.section('Create Simpli Project');

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-docs',
      validate: (value) => {
        const result = validateProjectName(value);
        if (!result.valid) {
          return result.errors[0];
        }
        return true;
      }
    }, {
      onCancel: () => {
        log.newline();
        log.error('Operation cancelled');
        process.exit(0);
      }
    });
    projectName = response.projectName;
  } else {
    const validation = validateProjectName(projectName);
    if (!validation.valid) {
      validation.errors.forEach(err => log.error(err));
      validation.warnings.forEach(warn => log.warn(warn));
      if (!validation.valid) process.exit(1);
    }
  }

  const targetDir = resolve(process.cwd(), projectName);
  const dirValidation = validateDirectory(targetDir);

  if (!dirValidation.valid) {
    if (fs.existsSync(targetDir)) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `Directory "${projectName}" already exists. Overwrite?`,
        initial: false
      }, {
        onCancel: () => {
          log.error('Operation cancelled');
          process.exit(0);
        }
      });

      if (!overwrite) {
        log.error('Operation cancelled');
        process.exit(0);
      }

      log.info('Removing existing directory...');
      removeDir(targetDir);
    } else {
      dirValidation.errors.forEach(err => log.error(err));
      process.exit(1);
    }
  }

  if (!template || !TEMPLATES.includes(template)) {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { 
          title: 'Default', 
          value: 'default', 
          description: 'Complete documentation site with search and dark mode'
        },
        { 
          title: 'Minimal', 
          value: 'minimal', 
          description: 'Bare minimum setup for simple documentation'
        },
      ]
    }, {
      onCancel: () => {
        log.error('Operation cancelled');
        process.exit(0);
      }
    });
    template = response.template || 'default';
  }

  const templateValidation = validateTemplate(template, TEMPLATES);
  if (!templateValidation.valid) {
    templateValidation.errors.forEach(err => log.error(err));
    process.exit(1);
  }

  if (!skipInstall && !packageManager) {
    const availablePMs = [];
    for (const pm of PACKAGE_MANAGERS) {
      if (await commandExists(pm.name)) {
        availablePMs.push(pm);
      }
    }

    if (availablePMs.length === 0) {
      availablePMs.push(PACKAGE_MANAGERS[0]);
    }

    const response = await prompts({
      type: 'select',
      name: 'packageManager',
      message: 'Select package manager:',
      choices: availablePMs.map(pm => ({ 
        title: pm.label, 
        value: pm.name,
        description: pm.name === 'npm' ? 'Default' : undefined
      }))
    }, {
      onCancel: () => {
        log.warn('Skipping installation');
      }
    });
    packageManager = response.packageManager || 'npm';
  }

  log.newline();
  log.step(1, 3, `Creating project "${bold(projectName)}" with ${bold(template)} template...`);

  try {
    createProject(targetDir, projectName, template);
    log.success('Project files created');
  } catch (error) {
    log.error('Failed to create project:', error);
    process.exit(1);
  }

  if (!skipInstall && packageManager) {
    log.step(2, 3, `Installing dependencies with ${bold(packageManager)}...`);
    log.newline();

    const pmConfig = PACKAGE_MANAGERS.find(pm => pm.name === packageManager);
    if (!pmConfig) {
      log.error(`Unknown package manager: ${packageManager}`);
      process.exit(1);
    }

    try {
      execSync(pmConfig.command, { 
        cwd: targetDir, 
        stdio: 'inherit',
        timeout: 300000
      });
      log.success('Dependencies installed successfully');
    } catch (error) {
      log.error('Failed to install dependencies');
      log.info('You can install them manually by running:');
      log.plain(`  cd ${projectName}`);
      log.plain(`  ${pmConfig.command}`);
    }
  } else {
    log.step(2, 3, 'Skipping dependency installation');
  }

  log.step(3, 3, 'Finalizing...');
  log.success('Project setup complete!');

  printNextSteps(projectName, packageManager, skipInstall);
}

function printNextSteps(projectName, packageManager, skipInstall) {
  const runCmd = packageManager && packageManager !== 'npm' 
    ? packageManager 
    : 'npm run';
  const cdCmd = `cd ${projectName}`;

  log.newline();
  log.bold('Next steps:');
  log.plain(cyan(`  ${cdCmd}`));
  
  if (skipInstall) {
    const installCmd = packageManager === 'yarn' ? 'yarn' : 
                       packageManager === 'pnpm' ? 'pnpm install' :
                       packageManager === 'bun' ? 'bun install' : 'npm install';
    log.plain(cyan(`  ${installCmd}`));
  }
  
  log.plain(cyan(`  ${runCmd === 'npm run' ? 'npm run dev' : `${runCmd} dev`}`));
  log.newline();
  
  log.dim('Documentation: https://simpli-docs.vercel.app');
  log.newline();
  log.plain('Happy documenting! 🚀');
  log.newline();
}

function createProject(targetDir, projectName, template) {
  ensureDir(targetDir);

  copyTemplateFiles(targetDir, template);
  processTemplateFiles(targetDir, projectName, template);
}

function copyTemplateFiles(targetDir, template) {
  copyDir(templateDir, targetDir);
}

function processTemplateFiles(targetDir, projectName, template) {
  const currentDate = new Date().toISOString().split('T')[0];
  const isMinimal = template === 'minimal';
  
  processDirectory(targetDir, { 
    projectName, 
    currentDate, 
    isMinimal,
    template 
  });
}

function processDirectory(dir, vars) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, vars);
    } else if (shouldProcessFile(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      content = replaceTemplateVars(content, vars);
      fs.writeFileSync(fullPath, content);
    }
  }
}

function shouldProcessFile(filename) {
  const processableExtensions = [
    '.json', '.ts', '.tsx', '.js', '.jsx', 
    '.mdx', '.md', '.html', '.css', '.yml', '.yaml'
  ];
  return processableExtensions.some(ext => filename.endsWith(ext));
}

function replaceTemplateVars(content, vars) {
  content = content.replace(/\{\{projectName\}\}/g, vars.projectName);
  content = content.replace(/\{\{currentDate\}\}/g, vars.currentDate);
  content = content.replace(/\{\{template\}\}/g, vars.template);
  
  if (vars.isMinimal) {
    content = content.replace(/\{\{#if minimal\}\}/g, '');
    content = content.replace(/\{\{\/if\}\}/g, '');
  } else {
    content = content.replace(/\{\{#if minimal\}\}[\s\S]*?\{\{\/if\}\]/g, '');
  }
  
  return content;
}

process.on('uncaughtException', (error) => {
  log.error('Unexpected error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

main().catch((error) => {
  log.error('Unexpected error:', error);
  process.exit(1);
});
