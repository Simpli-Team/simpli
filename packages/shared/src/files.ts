// ============================================================================
// Simpli Shared - File System Utilities
// ============================================================================

import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

// Copy directory recursively
export function copyDir(src: string, dest: string, options: {
  filter?: (src: string, dest: string) => boolean;
  transform?: (content: string, filePath: string) => string;
} = {}): void {
  const { filter, transform } = options;

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (filter && !filter(srcPath, destPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, options);
    } else {
      if (transform && shouldTransformFile(entry.name)) {
        let content = fs.readFileSync(srcPath, 'utf-8');
        content = transform(content, srcPath);
        fs.writeFileSync(destPath, content);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Check if file should be transformed
function shouldTransformFile(filename: string): boolean {
  const transformableExtensions = [
    '.json', '.ts', '.tsx', '.js', '.jsx', 
    '.mdx', '.md', '.html', '.css', '.yml', '.yaml'
  ];
  return transformableExtensions.some(ext => filename.endsWith(ext));
}

// Remove directory recursively
export function removeDir(dirPath: string): boolean {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Failed to remove directory: ${dirPath}`, error);
    return false;
  }
}

// Ensure directory exists
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Write file with directory creation
export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

// Read JSON file safely
export function readJson<T = unknown>(filePath: string, defaultValue?: T): T | undefined {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

// Write JSON file with formatting
export function writeJson(filePath: string, data: unknown, indent = 2): void {
  writeFile(filePath, JSON.stringify(data, null, indent));
}

// Find files recursively
export function findFiles(
  dir: string, 
  pattern: RegExp | string,
  options: { excludeDirs?: string[] } = {}
): string[] {
  const { excludeDirs = ['node_modules', '.git', 'dist', 'build'] } = options;
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        results.push(...findFiles(fullPath, pattern, options));
      }
    } else {
      const regex = typeof pattern === 'string' 
        ? new RegExp(pattern.replace(/\*/g, '.*')) 
        : pattern;
      
      if (regex.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// Get directory size recursively
export function getDirSize(dirPath: string): number {
  let size = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }

  return size;
}

// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check if path is empty directory
export function isEmptyDir(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return false;
  }

  const files = fs.readdirSync(dirPath);
  return files.length === 0;
}

// Safe file operations with rollback
export class FileOperations {
  private backups: Map<string, string> = new Map();

  backup(filePath: string): void {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      this.backups.set(filePath, backupPath);
    }
  }

  restore(filePath: string): boolean {
    const backupPath = this.backups.get(filePath);
    if (backupPath && fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      this.backups.delete(filePath);
      return true;
    }
    return false;
  }

  cleanup(): void {
    for (const [, backup] of this.backups) {
      if (fs.existsSync(backup)) {
        fs.unlinkSync(backup);
      }
    }
    this.backups.clear();
  }
}
