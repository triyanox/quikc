import { CacheOptions, CacheProvider, CacheStats, ILockProvider } from '../../types';
import { Redis } from 'ioredis';

/**
 * redis cache provider.
 */
class RedisCacheProvider implements CacheProvider {
  private redisClient: Redis;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor(redisClient: Redis) {
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
      await Promise.all(
        dependencies.map(async (dependency: string) => {
          pipeline.sadd(`${dependency}:dependents`, key);
        })
      );
      pipeline.sadd(`${key}:dependencies`, dependencies);
    }

    if (priority !== undefined) {
      pipeline.hset(key, 'priority', priority);
    }

    if (lockTimeout && this.lockProvider) {
      const lockAcquired = await this.lockProvider.acquireLock(key, lockTimeout);
      if (!lockAcquired) {
        return;
      }
      try {
        pipeline.hset(key, 'locked', 'true');
      } finally {
        await this.lockProvider.releaseLock(key);
      }
    }

    await pipeline.exec();
  }

  async del(key: string): Promise<void> {
    const dependentKeys = await this.getDependentKeys(key);
    if (dependentKeys?.length) {
      await this.delDependentKeys(dependentKeys);
    }
    await this.redisClient.del(key);
  }

  async getDependentKeys(key: string): Promise<string[] | undefined> {
    const dependentKeySet = await this.redisClient.smembers(`${key}:dependents`);
    if (!dependentKeySet) {
      return undefined;
    }
    return dependentKeySet;
  }

  async delDependentKeys(keys: string[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    keys.forEach((key) => pipeline.del(key));
    await pipeline.exec();
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
}

export default RedisCacheProvider;
