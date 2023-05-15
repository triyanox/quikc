import { CacheEntry, CacheOptions, CacheProvider, CacheStats, ILockProvider } from '../../types';

/**
 * in-memory cache provider.
 */
class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheEntry>;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor() {
    this.cache = new Map<string, CacheEntry>();
    this.stats = { hits: 0, misses: 0, hitRate: 0 };
  }

  async get(key: string): Promise<unknown | undefined> {
    const entry = this.cache.get(key);
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
    const dependencies = options?.dependencies;
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
      const lockAcquired = await this.lockProvider.acquireLock(key, lockTimeout);
      if (!lockAcquired) {
        return;
      }
      entry.locked = true;
    }

    this.cache.set(key, entry);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
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
}

export default MemoryCacheProvider;
