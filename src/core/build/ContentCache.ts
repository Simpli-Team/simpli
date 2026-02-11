// ============================================================================
// Simpli Framework - Content Cache
// ============================================================================
// File-based content caching system to avoid re-processing unchanged files.
// Uses file modification time + content hash for cache invalidation.
//
// Cache structure:
//   .simpli/cache/
//     manifest.json         → Maps file paths to cache entries
//     content/<hash>.json   → Cached processed content
//
// Benefits:
//   - ~10x faster rebuilds for large doc sites
//   - Only reprocesses changed files
//   - Automatic cleanup of stale entries
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface CacheEntry {
    /** File path (relative to project root) */
    filePath: string;
    /** File modification time (ms since epoch) */
    mtime: number;
    /** Content hash (SHA-256, first 16 chars) */
    contentHash: string;
    /** Cache file path for the processed result */
    cacheFile: string;
    /** Timestamp when cached */
    cachedAt: number;
}

export interface CacheManifest {
    version: number;
    entries: Record<string, CacheEntry>;
}

const CACHE_VERSION = 1;

export class ContentCache {
    private cacheDir: string;
    private contentDir: string;
    private manifest: CacheManifest;
    private manifestPath: string;
    private dirty = false;

    constructor(projectRoot: string) {
        this.cacheDir = path.join(projectRoot, '.simpli', 'cache');
        this.contentDir = path.join(this.cacheDir, 'content');
        this.manifestPath = path.join(this.cacheDir, 'manifest.json');
        this.manifest = this.loadManifest();
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Check if a file has a valid cache entry.
     */
    has(filePath: string): boolean {
        const entry = this.manifest.entries[filePath];
        if (!entry) return false;

        try {
            const stats = fs.statSync(filePath);
            const currentMtime = stats.mtimeMs;

            // Cache is valid if mtime hasn't changed
            if (entry.mtime === currentMtime) {
                // Also verify cache file exists
                return fs.existsSync(path.join(this.cacheDir, entry.cacheFile));
            }

            // Mtime changed - check content hash (handles saves without changes)
            const currentHash = this.hashFile(filePath);
            if (entry.contentHash === currentHash) {
                // Content unchanged, update mtime
                entry.mtime = currentMtime;
                this.dirty = true;
                return true;
            }
        } catch {
            // File doesn't exist or can't be read
        }

        return false;
    }

    /**
     * Get cached data for a file.
     */
    get<T>(filePath: string): T | null {
        if (!this.has(filePath)) return null;

        const entry = this.manifest.entries[filePath];
        const cacheFilePath = path.join(this.cacheDir, entry.cacheFile);

        try {
            const content = fs.readFileSync(cacheFilePath, 'utf-8');
            return JSON.parse(content) as T;
        } catch {
            // Cache file corrupted or missing
            delete this.manifest.entries[filePath];
            this.dirty = true;
            return null;
        }
    }

    /**
     * Store processed data in cache.
     */
    set(filePath: string, data: unknown): void {
        const hash = this.hashFile(filePath);
        const cacheFile = `content/${hash}.json`;

        // Ensure directories exist
        fs.mkdirSync(this.contentDir, { recursive: true });

        // Write cache file
        const cacheFilePath = path.join(this.cacheDir, cacheFile);
        fs.writeFileSync(cacheFilePath, JSON.stringify(data), 'utf-8');

        // Update manifest
        const stats = fs.statSync(filePath);
        this.manifest.entries[filePath] = {
            filePath,
            mtime: stats.mtimeMs,
            contentHash: hash,
            cacheFile,
            cachedAt: Date.now(),
        };

        this.dirty = true;
    }

    /**
     * Remove a specific cache entry.
     */
    invalidate(filePath: string): void {
        const entry = this.manifest.entries[filePath];
        if (entry) {
            // Remove cache file
            const cacheFilePath = path.join(this.cacheDir, entry.cacheFile);
            if (fs.existsSync(cacheFilePath)) {
                fs.unlinkSync(cacheFilePath);
            }
            delete this.manifest.entries[filePath];
            this.dirty = true;
        }
    }

    /**
     * Flush manifest to disk.
     * Call this when done with cache operations.
     */
    flush(): void {
        if (!this.dirty) return;

        fs.mkdirSync(this.cacheDir, { recursive: true });
        fs.writeFileSync(
            this.manifestPath,
            JSON.stringify(this.manifest, null, 2),
            'utf-8',
        );
        this.dirty = false;
    }

    /**
     * Clear all cache data.
     */
    clear(): void {
        if (fs.existsSync(this.cacheDir)) {
            fs.rmSync(this.cacheDir, { recursive: true, force: true });
        }
        this.manifest = { version: CACHE_VERSION, entries: {} };
        this.dirty = false;
    }

    /**
     * Remove cache entries for files that no longer exist.
     */
    prune(): number {
        let pruned = 0;

        for (const [filePath, entry] of Object.entries(this.manifest.entries)) {
            if (!fs.existsSync(filePath)) {
                // Remove cache file
                const cacheFilePath = path.join(this.cacheDir, entry.cacheFile);
                if (fs.existsSync(cacheFilePath)) {
                    fs.unlinkSync(cacheFilePath);
                }
                delete this.manifest.entries[filePath];
                pruned++;
            }
        }

        if (pruned > 0) {
            this.dirty = true;
        }

        return pruned;
    }

    /**
     * Get cache statistics.
     */
    stats(): { entries: number; sizeBytes: number } {
        let sizeBytes = 0;

        for (const entry of Object.values(this.manifest.entries)) {
            const cachePath = path.join(this.cacheDir, entry.cacheFile);
            if (fs.existsSync(cachePath)) {
                sizeBytes += fs.statSync(cachePath).size;
            }
        }

        return {
            entries: Object.keys(this.manifest.entries).length,
            sizeBytes,
        };
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    private loadManifest(): CacheManifest {
        try {
            if (fs.existsSync(this.manifestPath)) {
                const content = fs.readFileSync(this.manifestPath, 'utf-8');
                const manifest = JSON.parse(content) as CacheManifest;

                // Version check
                if (manifest.version === CACHE_VERSION) {
                    return manifest;
                }
            }
        } catch {
            // Corrupted manifest
        }

        return { version: CACHE_VERSION, entries: {} };
    }

    private hashFile(filePath: string): string {
        const content = fs.readFileSync(filePath, 'utf-8');
        return crypto
            .createHash('sha256')
            .update(content)
            .digest('hex')
            .slice(0, 16);
    }
}
