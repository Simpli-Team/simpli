// ============================================================================
// Simpli Shared - Validation Utilities
// ============================================================================

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate project name
export function validateProjectName(name: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!name) {
    result.valid = false;
    result.errors.push('Project name is required');
    return result;
  }

  if (name.length < 1 || name.length > 214) {
    result.valid = false;
    result.errors.push('Project name must be between 1 and 214 characters');
  }

  // Check for invalid characters (npm package name rules)
  if (!/^[a-z0-9-_.~]+$/.test(name)) {
    result.valid = false;
    result.errors.push(
      'Project name can only contain lowercase letters, numbers, hyphens (-), underscores (_), periods (.), and tildes (~)'
    );
  }

  // Check if starts with a valid character
  if (/^[._]/.test(name)) {
    result.valid = false;
    result.errors.push('Project name cannot start with a period (.) or underscore (_)');
  }

  // Check for reserved names
  const reservedNames = [
    'node_modules',
    'favicon.ico',
    'test',
    'tests',
    'spec',
    'specs',
    'src',
    'lib',
    'dist',
    'build',
    'public',
    'docs',
    'assets',
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    result.warnings.push(`"${name}" might be a reserved name and could cause conflicts`);
  }

  // Check for node built-in modules
  const nodeBuiltins = [
    'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
    'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
    'module', 'net', 'os', 'path', 'punycode', 'querystring', 'readline',
    'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty',
    'url', 'util', 'v8', 'vm', 'zlib'
  ];

  if (nodeBuiltins.includes(name.toLowerCase())) {
    result.warnings.push(`"${name}" is a Node.js built-in module name, which might cause confusion`);
  }

  return result;
}

// Check if directory exists and is empty
export function validateDirectory(dirPath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (fs.existsSync(dirPath)) {
    const stat = fs.statSync(dirPath);
    
    if (!stat.isDirectory()) {
      result.valid = false;
      result.errors.push(`Path exists but is not a directory: ${dirPath}`);
      return result;
    }

    const files = fs.readdirSync(dirPath);
    if (files.length > 0) {
      result.valid = false;
      result.errors.push(`Directory is not empty: ${dirPath}`);
      result.warnings.push(`Existing files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
    }
  }

  // Check if parent directory exists
  const parentDir = path.dirname(dirPath);
  if (!fs.existsSync(parentDir)) {
    result.valid = false;
    result.errors.push(`Parent directory does not exist: ${parentDir}`);
  }

  // Check write permissions
  try {
    fs.accessSync(parentDir, fs.constants.W_OK);
  } catch {
    result.valid = false;
    result.errors.push(`No write permission for directory: ${parentDir}`);
  }

  return result;
}

// Validate template name
export function validateTemplate(template: string, availableTemplates: string[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!template) {
    result.valid = false;
    result.errors.push('Template name is required');
    return result;
  }

  if (!availableTemplates.includes(template)) {
    result.valid = false;
    result.errors.push(
      `Invalid template "${template}". Available templates: ${availableTemplates.join(', ')}`
    );
  }

  return result;
}

// Validate port number
export function validatePort(port: string | number): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum)) {
    result.valid = false;
    result.errors.push(`Invalid port number: ${port}`);
    return result;
  }

  if (portNum < 1 || portNum > 65535) {
    result.valid = false;
    result.errors.push(`Port number must be between 1 and 65535`);
  }

  if (portNum < 1024) {
    result.warnings.push(`Port ${portNum} is a system port and might require elevated permissions`);
  }

  return result;
}

// Validate package manager
export function validatePackageManager(pm: string): ValidationResult {
  const validManagers = ['npm', 'yarn', 'pnpm', 'bun'];
  
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!validManagers.includes(pm)) {
    result.valid = false;
    result.errors.push(
      `Invalid package manager "${pm}". Valid options: ${validManagers.join(', ')}`
    );
  }

  return result;
}

// Check if command exists in PATH (synchronous)
export function checkCommandExists(command: string): boolean {
  const { execSync } = require('child_process');
  
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows 
      ? `where ${command}` 
      : `which ${command}`;
    
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Async version of checkCommandExists
export async function commandExists(command: string): Promise<boolean> {
  const { execSync } = await import('child_process');
  
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows 
      ? `where ${command}` 
      : `which ${command}`;
    
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Validate Node.js version
export function validateNodeVersion(minVersion = 18): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0], 10);

  if (majorVersion < minVersion) {
    result.valid = false;
    result.errors.push(
      `Node.js version ${currentVersion} is not supported. Minimum required: v${minVersion}.0.0`
    );
  }

  return result;
}
