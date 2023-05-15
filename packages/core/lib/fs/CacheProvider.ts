import fs from 'fs';
import { CacheEntry, CacheOptions, CacheProvider, CacheStats, ILockProvider } from '../../types';
import path from 'path';

/**
 * A cache provider that stores cache entries in the file system.
 */
class FileSystemCacheProvider implements CacheProvider {
  private cachePath: string;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.stats = { hits: 0, misses: 0, hitRate: 0 };
    this.ensureCacheDirectoryExists();
  }

  private ensureCacheDirectoryExists(): void {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cachePath, `${key}.json`);
  }

  private writeCacheFile(filePath: string, entry: CacheEntry): void {
    const data = JSON.stringify(entry);
    fs.writeFileSync(filePath, data);
  }

  private readCacheFile(filePath: string): CacheEntry | undefined {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to read cache file: ${filePath}`, error);
      return undefined;
    }
  }

  async get(key: string): Promise<unknown | undefined> {
    const filePath = this.getCacheFilePath(this.formatKey(key));
    const entry = this.readCacheFile(filePath);

    if (!entry || entry.expiresAt < Date.now()) {
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl ?? 0;
    const expiresAt = Date.now() + ttl * 1000;
    const dependencies = options?.dependencies?.map((dependency) => this.formatKey(dependency));
    const priority = options?.priority;
    const lockTimeout = options?.lockTimeout;

    const entry: CacheEntry = {
      value,
      expiresAt,
      dependencies,
      priority,
      locked: false
    };

    if (lockTimeout && this.lockProvider) {
      const lockAcquired = await this.lockProvider.acquireLock(this.formatKey(key), lockTimeout);
      if (!lockAcquired) {
        return;
      }
      entry.locked = true;
    }

    const filePath = this.getCacheFilePath(this.formatKey(key));
    this.writeCacheFile(filePath, entry);
  }

  async del(key: string): Promise<void> {
    const filePath = this.getCacheFilePath(key);
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Failed to delete cache file: ${filePath}`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const files = fs.readdirSync(this.cachePath);
      files.forEach((file) => {
        const filePath = path.join(this.cachePath, file);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Failed to clear cache directory:', error);
    }
  }

  getStats(): CacheStats {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses);
    this.stats.hitRate = isNaN(hitRate) ? 0 : hitRate;
    return { ...this.stats };
  }

  setLockProvider(lockProvider: ILockProvider): void {
    this.lockProvider = lockProvider;
  }

  withLockProvider(lockProvider: ILockProvider): CacheProvider {
    this.setLockProvider(lockProvider);
    return this;
  }

  private formatKey(key: string): string {
    return key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
}

export default FileSystemCacheProvider;
