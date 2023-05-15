import { CacheEntry, CacheOptions, CacheProvider, CacheStats, ILockProvider } from '../../types';

/**
 * in-memory cache provider.
 */
class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheEntry>;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor() {
    this.cache = new Map();
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
    const dependencies = options?.dependencies?.map((dependency) => dependency);
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
    const dependentKeys = await this.getDependentKeys(key);
    if (dependentKeys?.length) {
      await this.delDependentKeys(dependentKeys);
    }
    this.cache.delete(key);
  }

  async getDependentKeys(key: string): Promise<string[] | undefined> {
    const dependentKeys: Set<string> = new Set();
    this.cache.forEach((entry, entryKey) => {
      if (entry.dependencies?.includes(key)) {
        dependentKeys.add(entryKey);
      }
    });
    return Array.from(dependentKeys);
  }

  async delDependentKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.del(key);
    }
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
}

export default MemoryCacheProvider;
