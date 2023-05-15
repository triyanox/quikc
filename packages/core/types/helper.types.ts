import { Redis } from 'ioredis';

/**
 * The type of cache provider to create.
 */
type ProviderType = 'memory' | 'fs' | 'redis';

/**
 * The options to use when creating a cache provider.
 */
type CacheProviderOptions<T extends ProviderType> = T extends 'memory'
  ? undefined
  : T extends 'fs'
  ? {
      /**
       * The path to the cache directory.
       */
      cachePath: string;
    }
  : T extends 'redis'
  ? {
      /**
       * The Redis client to use.
       */
      redisClient: Redis;
    }
  : never;

/**
 * The options to use when creating a lock provider.
 */
type LockProviderOptions<T extends ProviderType> = T extends 'memory'
  ? undefined
  : T extends 'fs'
  ? {
      /**
       * The path to the lock directory.
       */
      lockPath: string;
    }
  : T extends 'redis'
  ? {
      /**
       * The Redis client to use.
       */
      redisClient: Redis;
    }
  : never;

export { CacheProviderOptions, LockProviderOptions, ProviderType };
