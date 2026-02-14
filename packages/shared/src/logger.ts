// ============================================================================
// Simpli Shared - Logger Utilities
// ============================================================================

import { cyan, green, red, yellow, bold, dim, blue } from 'kolorist';

export interface LoggerOptions {
  verbose?: boolean;
  silent?: boolean;
  prefix?: string;
}

export class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      verbose: false,
      silent: false,
      prefix: 'simpli',
      ...options,
    };
  }

  private formatMessage(message: string): string {
    return this.options.prefix ? `[${this.options.prefix}] ${message}` : message;
  }

  private shouldLog(): boolean {
    return !this.options.silent;
  }

  // Success messages
  success(message: string): void {
    if (this.shouldLog()) {
      console.log(green('✔'), this.formatMessage(message));
    }
  }

  // Error messages
  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog()) {
      console.error(red('✖'), this.formatMessage(message));
      if (error instanceof Error && this.options.verbose) {
        console.error(dim(error.stack || error.message));
      }
    }
  }

  // Warning messages
  warn(message: string): void {
    if (this.shouldLog()) {
      console.warn(yellow('⚠'), this.formatMessage(message));
    }
  }

  // Info messages
  info(message: string): void {
    if (this.shouldLog()) {
      console.info(cyan('ℹ'), this.formatMessage(message));
    }
  }

  // Debug messages (only in verbose mode)
  debug(message: string): void {
    if (this.shouldLog() && this.options.verbose) {
      console.log(dim(`[debug] ${message}`));
    }
  }

  // Section headers
  section(title: string): void {
    if (this.shouldLog()) {
      console.log();
      console.log(bold(cyan(title)));
      console.log(cyan('─'.repeat(title.length)));
    }
  }

  // Step indicator
  step(stepNumber: number, totalSteps: number, message: string): void {
    if (this.shouldLog()) {
      const stepStr = cyan(`[${stepNumber}/${totalSteps}]`);
      console.log(`${stepStr} ${message}`);
    }
  }

  // New line
  newline(): void {
    if (this.shouldLog()) {
      console.log();
    }
  }

  // Plain text (no prefix)
  plain(message: string): void {
    if (this.shouldLog()) {
      console.log(message);
    }
  }

  // Bold text
  bold(message: string): void {
    if (this.shouldLog()) {
      console.log(bold(message));
    }
  }

  // Dim text
  dim(message: string): void {
    if (this.shouldLog()) {
      console.log(dim(message));
    }
  }

  // Spinner placeholder (for future async operations)
  startSpinner(message: string): Spinner {
    if (this.shouldLog()) {
      process.stdout.write(`${cyan('⏳')} ${message}...`);
      return new SpinnerImpl(this);
    }
    return new NoOpSpinner();
  }
}

// Spinner interface
export interface Spinner {
  succeed(message?: string): void;
  fail(message?: string): void;
  stop(): void;
}

class SpinnerImpl implements Spinner {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_logger: Logger) {
    // Spinner uses console directly - _logger reserved for future use
  }

  succeed(message?: string): void {
    if (message) {
      console.log(`\r${green('✔')} ${message}`);
    } else {
      console.log(`\r${green('✔')}`);
    }
  }

  fail(message?: string): void {
    if (message) {
      console.log(`\r${red('✖')} ${message}`);
    } else {
      console.log(`\r${red('✖')}`);
    }
  }

  stop(): void {
    console.log();
  }
}

class NoOpSpinner implements Spinner {
  succeed(): void {}
  fail(): void {}
  stop(): void {}
}

// Create default logger instance
export const logger = new Logger();

// Export colored functions for direct use
export { cyan, green, red, yellow, bold, dim, blue };
