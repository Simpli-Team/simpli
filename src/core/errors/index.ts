// ============================================================================
// Simpli Framework - Error Handling System (Production Level)
// ============================================================================

export class SimpliError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    code: string,
    message: string,
    options?: {
      details?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'SimpliError';
    this.code = code;
    this.details = options?.details;
    this.cause = options?.cause;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SimpliError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

// Configuration Errors
export class ConfigError extends SimpliError {
  constructor(
    message: string,
    options?: { details?: Record<string, unknown>; cause?: Error }
  ) {
    super('CONFIG_ERROR', message, options);
    this.name = 'ConfigError';
  }
}

// Content Errors
export class ContentError extends SimpliError {
  constructor(
    message: string,
    options?: { details?: Record<string, unknown>; cause?: Error }
  ) {
    super('CONTENT_ERROR', message, options);
    this.name = 'ContentError';
  }
}

// Build Errors
export class BuildError extends SimpliError {
  constructor(
    message: string,
    options?: { details?: Record<string, unknown>; cause?: Error }
  ) {
    super('BUILD_ERROR', message, options);
    this.name = 'BuildError';
  }
}

// Plugin Errors
export class PluginError extends SimpliError {
  constructor(
    message: string,
    options?: { details?: Record<string, unknown>; cause?: Error }
  ) {
    super('PLUGIN_ERROR', message, options);
    this.name = 'PluginError';
  }
}

// Router Errors
export class RouterError extends SimpliError {
  constructor(
    message: string,
    options?: { details?: Record<string, unknown>; cause?: Error }
  ) {
    super('ROUTER_ERROR', message, options);
    this.name = 'RouterError';
  }
}

// Validation Errors
export class ValidationError extends SimpliError {
  public readonly field?: string;
  
  constructor(
    message: string,
    options?: { field?: string; details?: Record<string, unknown>; cause?: Error }
  ) {
    super('VALIDATION_ERROR', message, options);
    this.name = 'ValidationError';
    this.field = options?.field;
  }
}

// Error codes mapping for user-friendly messages
export const ErrorCodes: Record<string, string> = {
  CONFIG_ERROR: 'Configuration error',
  CONTENT_ERROR: 'Content processing error',
  BUILD_ERROR: 'Build error',
  PLUGIN_ERROR: 'Plugin error',
  ROUTER_ERROR: 'Routing error',
  VALIDATION_ERROR: 'Validation error',
  FILE_NOT_FOUND: 'File not found',
  INVALID_SYNTAX: 'Invalid syntax',
  MISSING_DEPENDENCY: 'Missing dependency',
};

// Error handler utility
export function handleError(error: unknown): never {
  if (error instanceof SimpliError) {
    console.error(`[${error.code}] ${error.message}`);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.cause) {
      console.error('Caused by:', error.cause.message);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error('[UNEXPECTED_ERROR]', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.error('[UNKNOWN_ERROR]', String(error));
  process.exit(1);
}

// Async wrapper for error handling
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error);
    }
    return undefined;
  }
}

// Sync wrapper for error handling
export function tryCatchSync<T>(
  fn: () => T,
  errorHandler?: (error: unknown) => void
): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error);
    }
    return undefined;
  }
}
