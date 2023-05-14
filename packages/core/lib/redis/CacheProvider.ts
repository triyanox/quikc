import {
  CacheOptions,
  CacheProvider,
  CacheStats,
  ILockProvider,
  RedisClient
} from 'packages/core/types';

/**
 * redis cache provider.
 */
class RedisCacheProvider implements CacheProvider {
  private redisClient: RedisClient;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
    this.stats = { hits: 0, misses: 0, hitRate: 0 };
  }

  async get(key: string): Promise<unknown | undefined> {
    const cachedValue = await this.redisClient.get(key);
    if (!cachedValue) {
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return JSON.parse(cachedValue);
  }

  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl ?? 0;
    const dependencies = options?.dependencies;
    const priority = options?.priority;
    const lockTimeout = options?.lockTimeout;

    const pipeline = this.redisClient.pipeline();
    pipeline.set(key, JSON.stringify(value));
    pipeline.expire(key, ttl);

    if (dependencies) {
      pipeline.sadd(`${key}:dependencies`, ...dependencies);
    }

    if (priority !== undefined) {
      pipeline.hset(key, 'priority', priority);
    }

    if (lockTimeout && this.lockProvider) {
      const lockAcquired = await this.lockProvider.acquireLock(key, lockTimeout);
      if (!lockAcquired) {
        return;
      }
      pipeline.hset(key, 'locked', 'true');
    }

    await pipeline.exec();
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear(): Promise<void> {
    await this.redisClient.flushdb();
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

export default RedisCacheProvider;
