import { MongoClient } from './mongo.types';
import { RedisClient } from './redis.types';

/**
 * The type of cache provider to create.
 */
type ProviderType = 'memory' | 'fs' | 'redis' | 'mongo';

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
      redisClient: RedisClient;
    }
  : T extends 'mongo'
  ? {
      /**
       * The MongoDB client to use.
       */
      mongoClient: MongoClient;
      /**
       * The name of the database to use.
       */
      dbName: string;
      /**
       * The name of the collection to use.
       */
      collectionName: string;
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
      redisClient: RedisClient;
    }
  : T extends 'mongo'
  ? {
      /**
       * The MongoDB client to use.
       */
      mongoClient: MongoClient;
      /**
       * The name of the database to use.
       */
      dbName: string;
      /**
       * The name of the collection to use.
       */
      collectionName: string;
    }
  : never;

export { ProviderType, CacheProviderOptions, LockProviderOptions };
