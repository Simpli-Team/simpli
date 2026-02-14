// ============================================================================
// Simpli Framework - Configuration Validator (Production Level)
// ============================================================================

import { ValidationError } from '../errors/index.js';
import type { SimpliUserConfig, ThemeConfig, NavbarItem } from '../config/types.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// Valid font families
const VALID_FONTS = ['inter', 'prompt', 'sarabun', 'kanit', 'noto-sans-thai'] as const;

// Valid navbar item types
const VALID_NAVBAR_ITEM_TYPES = ['link', 'search', 'themeToggle', 'localeDropdown', 'docsVersionDropdown'] as const;

// Valid color modes
const VALID_COLOR_MODES = ['light', 'dark'] as const;

// Valid footer styles
const VALID_FOOTER_STYLES = ['light', 'dark'] as const;

// Valid search providers
const VALID_SEARCH_PROVIDERS = ['local', 'algolia'] as const;

export class ConfigValidator {
  private errors: ValidationError[] = [];
  private warnings: string[] = [];

  validate(config: SimpliUserConfig): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Required fields
    this.validateRequired(config);
    
    // Theme config
    if (config.themeConfig) {
      this.validateThemeConfig(config.themeConfig);
    }

    // URL validation
    if (config.url) {
      this.validateUrl(config.url, 'url');
    }

    // Base URL validation
    if (config.baseUrl) {
      this.validateBaseUrl(config.baseUrl);
    }

    // Docs directory
    if (config.docsDir) {
      this.validatePath(config.docsDir, 'docsDir');
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private validateRequired(config: SimpliUserConfig): void {
    if (!config.title) {
      this.errors.push(new ValidationError('Configuration must have a title', { field: 'title' }));
    } else if (typeof config.title !== 'string') {
      this.errors.push(new ValidationError('Title must be a string', { field: 'title' }));
    } else if (config.title.length > 100) {
      this.warnings.push('Title is quite long (>100 chars), consider shortening it');
    }

    if (config.tagline && typeof config.tagline !== 'string') {
      this.errors.push(new ValidationError('Tagline must be a string', { field: 'tagline' }));
    }
  }

  private validateThemeConfig(themeConfig: ThemeConfig): void {
    // Font validation
    if (themeConfig.font) {
      if (themeConfig.font.family && !VALID_FONTS.includes(themeConfig.font.family as typeof VALID_FONTS[number])) {
        this.warnings.push(
          `Font family "${themeConfig.font.family}" is not one of the recommended fonts. ` +
          `Recommended: ${VALID_FONTS.join(', ')}`
        );
      }

      if (themeConfig.font.weights) {
        if (!Array.isArray(themeConfig.font.weights)) {
          this.errors.push(new ValidationError('Font weights must be an array', { field: 'themeConfig.font.weights' }));
        } else {
          const validWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
          const invalidWeights = themeConfig.font.weights.filter(w => !validWeights.includes(w));
          if (invalidWeights.length > 0) {
            this.warnings.push(`Invalid font weights: ${invalidWeights.join(', ')}`);
          }
        }
      }
    }

    // Color mode validation
    if (themeConfig.colorMode) {
      if (themeConfig.colorMode.defaultMode && 
          !VALID_COLOR_MODES.includes(themeConfig.colorMode.defaultMode as typeof VALID_COLOR_MODES[number])) {
        this.errors.push(new ValidationError(
          `Invalid defaultMode: ${themeConfig.colorMode.defaultMode}. Must be: ${VALID_COLOR_MODES.join(', ')}`,
          { field: 'themeConfig.colorMode.defaultMode' }
        ));
      }
    }

    // Navbar validation
    if (themeConfig.navbar) {
      this.validateNavbar(themeConfig.navbar);
    }

    // Footer validation
    if (themeConfig.footer) {
      this.validateFooter(themeConfig.footer);
    }

    // Search validation
    if (themeConfig.search) {
      this.validateSearch(themeConfig.search);
    }
  }

  private validateNavbar(navbar: NonNullable<ThemeConfig['navbar']>): void {
    if (navbar.items && Array.isArray(navbar.items)) {
      navbar.items.forEach((item, index) => {
        this.validateNavbarItem(item, `themeConfig.navbar.items[${index}]`);
      });
    }

    if (navbar.logo) {
      if (navbar.logo.src && typeof navbar.logo.src !== 'string') {
        this.errors.push(new ValidationError('Logo src must be a string', { field: 'themeConfig.navbar.logo.src' }));
      }
    }
  }

  private validateNavbarItem(item: NavbarItem, path: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemAny = item as Record<string, any>;
    
    if (!item.type && !itemAny.to && !itemAny.href) {
      this.errors.push(new ValidationError(
        'Navbar item must have either type, to, or href',
        { field: path }
      ));
    }

    if (item.type && !VALID_NAVBAR_ITEM_TYPES.includes(item.type as typeof VALID_NAVBAR_ITEM_TYPES[number])) {
      this.warnings.push(`Unknown navbar item type: ${item.type} at ${path}`);
    }

    if (itemAny.to && typeof itemAny.to !== 'string') {
      this.errors.push(new ValidationError('Navbar item "to" must be a string', { field: path }));
    }

    if (itemAny.href && typeof itemAny.href !== 'string') {
      this.errors.push(new ValidationError('Navbar item "href" must be a string', { field: path }));
    }

    if (itemAny.label && typeof itemAny.label !== 'string') {
      this.errors.push(new ValidationError('Navbar item "label" must be a string', { field: path }));
    }

    // Check for external links without position
    if (itemAny.href && !item.position) {
      this.warnings.push(`External link at ${path} should have a position specified`);
    }
  }

  private validateFooter(footer: NonNullable<ThemeConfig['footer']>): void {
    if (footer.style && !VALID_FOOTER_STYLES.includes(footer.style as typeof VALID_FOOTER_STYLES[number])) {
      this.errors.push(new ValidationError(
        `Invalid footer style: ${footer.style}. Must be: ${VALID_FOOTER_STYLES.join(', ')}`,
        { field: 'themeConfig.footer.style' }
      ));
    }

    if (footer.links && Array.isArray(footer.links)) {
      footer.links.forEach((section, index) => {
        if (!section.title) {
          this.warnings.push(`Footer section ${index} is missing a title`);
        }
        if (!section.items || !Array.isArray(section.items)) {
          this.errors.push(new ValidationError(
            `Footer section ${index} must have an items array`,
            { field: `themeConfig.footer.links[${index}]` }
          ));
        }
      });
    }
  }

  private validateSearch(search: NonNullable<ThemeConfig['search']>): void {
    if (search.provider && !VALID_SEARCH_PROVIDERS.includes(search.provider as typeof VALID_SEARCH_PROVIDERS[number])) {
      this.errors.push(new ValidationError(
        `Invalid search provider: ${search.provider}. Must be: ${VALID_SEARCH_PROVIDERS.join(', ')}`,
        { field: 'themeConfig.search.provider' }
      ));
    }

    if (search.provider === 'algolia' && (!search.algolia || !search.algolia.apiKey)) {
      this.warnings.push('Algolia search is configured but apiKey is missing');
    }
  }

  private validateUrl(url: string, field: string): void {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        this.warnings.push(`URL at ${field} should use http: or https: protocol`);
      }
    } catch {
      this.errors.push(new ValidationError(`Invalid URL: ${url}`, { field }));
    }
  }

  private validateBaseUrl(baseUrl: string): void {
    if (!baseUrl.startsWith('/')) {
      this.errors.push(new ValidationError('baseUrl must start with "/"', { field: 'baseUrl' }));
    }
    if (!baseUrl.endsWith('/')) {
      this.warnings.push('baseUrl should end with "/" for consistency');
    }
  }

  private validatePath(filePath: string, field: string): void {
    if (typeof filePath !== 'string') {
      this.errors.push(new ValidationError(`Path must be a string`, { field }));
      return;
    }

    // Check for invalid characters in path
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filePath)) {
      this.errors.push(new ValidationError(`Path contains invalid characters`, { field }));
    }
  }

  // Static method for quick validation
  static quickValidate(config: SimpliUserConfig): boolean {
    const validator = new ConfigValidator();
    const result = validator.validate(config);
    return result.valid;
  }

  // Static method for validation with details
  static validateWithDetails(config: SimpliUserConfig): ValidationResult {
    const validator = new ConfigValidator();
    return validator.validate(config);
  }
}

// Export singleton instance
export const configValidator = new ConfigValidator();

// Export validation functions
export function validateConfig(config: SimpliUserConfig): ValidationResult {
  return configValidator.validate(config);
}

export function isValidConfig(config: SimpliUserConfig): boolean {
  return ConfigValidator.quickValidate(config);
}
