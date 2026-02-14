// ============================================================================
// Simpli Shared - Main Exports
// ============================================================================

export { Logger, logger } from './logger.js';
export type { LoggerOptions, Spinner } from './logger.js';
export { cyan, green, red, yellow, bold, dim, blue } from './logger.js';

export {
  validateProjectName,
  validateDirectory,
  validateTemplate,
  validatePort,
  validatePackageManager,
  commandExists,
  validateNodeVersion,
} from './validation.js';
export type { ValidationResult } from './validation.js';

export {
  copyDir,
  removeDir,
  ensureDir,
  writeFile,
  readJson,
  writeJson,
  findFiles,
  getDirSize,
  formatBytes,
  isEmptyDir,
  FileOperations,
} from './files.js';
