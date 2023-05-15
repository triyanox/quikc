/**
 * Options for cache entries.
 */
interface CacheOptions {
  /**
   * Time-to-live (TTL) in seconds. After this time has elapsed, the cache entry will be considered stale and will be purged.
   */
  ttl: number;

  /**
   * An optional array of cache entry dependencies.
   */
  dependencies?: string[];

  /**
   * An optional priority value for the cache entry.
   */
  priority?: number;

  /**
   * An optional timeout value for acquiring a lock on the cache entry.
   */
  lockTimeout?: number;
}

/**
 * Represents a cache entry.
 */
interface CacheEntry {
  /**
   * The value of the cache entry.
   */
  value: unknown;

  /**
   * The time at which the cache entry expires.
   */
  expiresAt: number;

  /**
   * An optional array of cache entry dependencies.
   */
  dependencies?: string[];

  /**
   * An optional priority value for the cache entry.
   */
  priority?: number;

  /**
   * An optional timeout value for acquiring a lock on the cache entry.
   */
  locked?: boolean;
}

/**
 * Provides methods for caching and retrieving data.
 */
interface CacheProvider {
  /**
   * Gets the value associated with the specified key from the cache.
   * @param key The key to retrieve the value for.
   * @returns A Promise that resolves to the value associated with the key, or `undefined` if the key is not found or the entry is stale.
   */
  get(key: string): Promise<unknown | undefined>;

  /**
   * Stores a value in the cache using the specified key.
   * @param key The key to store the value under.
   * @param value The value to store in the cache.
   * @param options Optional cache options.
   * @returns A Promise that resolves when the value is successfully stored in the cache.
   */
  set(key: string, value: unknown, options?: CacheOptions): Promise<void>;

  /**
   * Removes the cache entry associated with the specified key.
   * @param key The key of the cache entry to remove.
   * @returns A Promise that resolves when the cache entry is successfully removed.
   */
  del(key: string): Promise<void>;

  /**
   * Clears all cached entries from the cache.
   * @returns A Promise that resolves when the cache is successfully cleared.
   */
  clear(): Promise<void>;

  /**
   * Retrieves cache statistics.
   * @returns An object containing cache statistics including hits, misses, and hit rate.
   */
  getStats(): CacheStats;

  /**
   * Sets a lock provider to handle cache locking.
   * @param lockProvider The lock provider to use for cache locking.
   */
  setLockProvider(lockProvider: ILockProvider): void;

  /**
   * Gets the dependent keys for the specified key.
   */
  getDependentKeys(key: string): Promise<string[] | undefined>;
  /**
   * Deletes the dependent keys for the specified key.
   */
  delDependentKeys(keys: string[]): Promise<void>;
}

/**
 * Represents cache statistics.
 */
interface CacheStats {
  /**
   * The number of cache hits.
   */
  hits: number;
  /**
   * The number of cache misses.
   */
  misses: number;
  /**
   * The hit rate of the cache.
   */
  hitRate: number;
}

/**
 * Provides methods for acquiring and releasing locks on cache entries.
 */
interface ILockProvider {
  /**
   * Acquires a lock on the specified cache entry.
   * @param key The key of the cache entry to acquire the lock on.
   * @param timeout Optional timeout in milliseconds for acquiring the lock.
   * @returns A Promise that resolves to `true` if the lock is successfully acquired, or `false` otherwise.
   */
  acquireLock(key: string, timeout?: number): Promise<boolean>;

  /**
   * Releases the lock on the specified cache entry.
   * @param key The key of the cache entry to release the lock on.
   * @returns A Promise that resolves when the lock is successfully released.
   */
  releaseLock(key: string): Promise<void>;

  /**
   * Clears all locks.
   * @returns A Promise that resolves when all locks are successfully cleared.
   * @remarks This method is intended for testing purposes only.
   */
  clearLocks(): Promise<void>;

  /**
   * Get a lock by key.
   */
  getLock(key: string): Promise<boolean | undefined>;
}

export { CacheEntry, CacheOptions, CacheProvider, CacheStats, ILockProvider };
